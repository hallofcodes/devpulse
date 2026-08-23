import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { NODE_MAILER_USER, transporter } from "../smtp/nodemailer";
import emailTemplate from "../smtp/template";
import crypto from "crypto";

/**
 * Verifies the email address for a given user.
 *
 * @param email The email address to verify.
 * @returns A JSON response indicating success or failure.
 */
export default async function verifyEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    if (user.email_verified) {
      return NextResponse.json({ success: true });
    }

    // Delete any existing verification token for this email before creating a new one
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours from now

    await prisma.verificationToken.create({
      data: { identifier: email, token: verificationToken, expires },
    });

    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`;

    console.info(`Email verification link for ${email}: ${verifyUrl}`);

    transporter.sendMail({
      from: `Do Not Reply <${NODE_MAILER_USER}>`,
      to: email,
      subject: "Verify your email",
      html: emailTemplate({
        title: "Verify your email",
        bodyHtml: `
          <p>Hi <b>${user.name}</b>,</p>
          <p>Thanks for signing up! Please confirm your email address by clicking the button below.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background-color: #1a1f2e; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 15px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p style="color: #6b7280; font-size: 13px;">
            Or copy and paste this link into your browser:<br/>
            <a href="${verifyUrl}" style="color: #4f46e5; word-break: break-all;">${verifyUrl}</a>
          </p>
          <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">
            This link will expire in 6 hours. If you didn't create a Devpulse account, you can safely ignore this email.
          </p>
        `,
      }),
    });
  } catch (error) {
    console.error(error);
  }
}
