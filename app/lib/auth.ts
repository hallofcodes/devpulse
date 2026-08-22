import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { recaptcha } from "./recaptcha";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
        token: { type: "string" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const token = credentials.token as string;

        if (!token) {
          throw new Error("reCAPTCHA verification failed. Please try again.");
        }

        // recaptcha verification
        if (!(await recaptcha(token, "login")))
          throw new Error("reCAPTCHA verification failed. Please try again.");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    Google,
    GitHub,
    MicrosoftEntraID,
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }

      if (typeof user?.role === "string") {
        token.role = user.role;
      }

      // Re-query DB when role is unset OR emailVerified is null/undefined.
      // The null check means unverified users trigger a DB lookup on each
      // request so that verification is picked up immediately without a
      // forced re-login.
      if (
        token.sub &&
        (typeof token.role !== "string" ||
          !token.email_verified ||
          !token.wakatime_api_key)
      ) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, email_verified: true, wakatime_api_key: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.email_verified = dbUser.email_verified;
          token.wakatime_api_key = dbUser.wakatime_api_key;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      session.user.role = typeof token.role === "string" ? token.role : "user";
      session.user.email_verified =
        (token.email_verified as Date | null | undefined) ?? null;
      session.user.wakatime_api_key = token.wakatime_api_key;
      return session;
    },
    async signIn({ user, account }) {
      if (!user.id) return true;

      await prisma.userStats.upsert({
        where: { user_id: user.id },
        create: { user_id: user.id },
        update: {},
      });

      await prisma.userProjects.upsert({
        where: { user_id: user.id },
        create: { user_id: user.id },
        update: {},
      });

      const globalConversationId = process.env.GLOBAL_CONVERSATION_ID;
      if (globalConversationId && user.email) {
        await prisma.conversation.upsert({
          where: { id: globalConversationId },
          create: { id: globalConversationId, type: "GLOBAL" },
          update: {},
        });

        await prisma.conversationParticipant.upsert({
          where: {
            conversation_id_user_id: {
              conversation_id: globalConversationId,
              user_id: user.id,
            },
          },
          create: {
            conversation_id: globalConversationId,
            user_id: user.id,
            email: user.email,
            type: "global",
          },
          update: {},
        });
      }

      void account;
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
