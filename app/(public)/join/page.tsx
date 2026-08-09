import { Metadata } from "next/types";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth/user";
import JoinButton from "../../components/JoinButton";
import Footer from "@/app/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faCircleXmark,
  faRankingStar,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

async function getLeaderboard(code: string) {
  return prisma.leaderboard.findUnique({
    where: { joinCode: code },
    select: {
      id: true,
      name: true,
      description: true,
      slug: true,
      ownerId: true,
      createdAt: true,
    },
  });
}

async function getMemberCount(leaderboardId: string) {
  return prisma.leaderboardMember.count({ where: { leaderboardId } });
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { id } = await searchParams;
  const code = (id || "").trim();

  if (!code) {
    return {
      title: "Join - Devpulse",
      description: "Open an invite link to join a Devpulse leaderboard.",
      alternates: { canonical: "https://devpulse.hallofcodes.org/join" },
    };
  }

  const leaderboard = await getLeaderboard(code);
  if (!leaderboard) {
    return {
      title: "Invite Not Found - Devpulse",
      description: "This invite link is invalid or has expired.",
      alternates: { canonical: "https://devpulse.hallofcodes.org/join" },
    };
  }

  const title = `You're invited to join ${leaderboard.name}!`;
  const description =
    leaderboard.description && leaderboard.description.length > 0
      ? leaderboard.description
      : `Join the ${leaderboard.name} leaderboard on Devpulse and compete with other developers.`;

  return {
    title: `${title} - Devpulse`,
    description,
    alternates: {
      canonical: `https://devpulse.hallofcodes.org/join?id=${encodeURIComponent(code)}`,
    },
    openGraph: { title, description, type: "website", siteName: "Devpulse" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function JoinPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const code = (id || "").trim();

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center  grid-bg">
        <div className="glass-card p-10 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
            <FontAwesomeIcon
              icon={faCircleInfo}
              className="w-8 h-8 text-indigo-600"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Join a Leaderboard
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Open an invite link like{" "}
            <span className="font-mono">/join?id=XXXXXXXX</span>.
          </p>
          <Link href="/" className="btn-primary inline-block px-6 py-3 text-sm">
            Go to Devpulse
          </Link>
        </div>
      </div>
    );
  }

  const [leaderboard, { user }] = await Promise.all([
    getLeaderboard(code),
    getCurrentUser(),
  ]);

  if (!leaderboard) {
    return (
      <div className="min-h-screen flex items-center justify-center  grid-bg">
        <div className="glass-card p-10 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <FontAwesomeIcon
              icon={faCircleXmark}
              className="w-8 h-8 text-red-600"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Invite Not Found
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            This invite link is invalid or has expired.
          </p>
          <Link href="/" className="btn-primary inline-block px-6 py-3 text-sm">
            Go to Devpulse
          </Link>
        </div>
      </div>
    );
  }

  const memberCount = await getMemberCount(leaderboard.id);

  let alreadyMember = false;
  if (user) {
    const membership = await prisma.leaderboardMember.findUnique({
      where: {
        leaderboardId_userId: {
          leaderboardId: leaderboard.id,
          userId: user.id,
        },
      },
      select: { id: true },
    });
    alreadyMember = !!membership;
  }

  return (
    <div className="min-h-screen  grid-bg relative overflow-hidden">
      <div className="glow-orb w-[500px] h-[500px] bg-indigo-600/20 top-[-200px] left-1/2 -translate-x-1/2 absolute" />
      <div className="glow-orb w-[300px] h-[300px] bg-purple-600/15 bottom-[-100px] right-[-50px] absolute" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <div className="glass-card max-w-lg w-full p-8 md:p-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.15)]">
              <Image src="/logo.svg" alt="Devpulse" width={36} height={36} />
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-semibold mb-3">
            {alreadyMember
              ? "You’re already a member of"
              : "You’ve been invited to"}
          </p>

          <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">
            {leaderboard.name}
          </h1>

          {leaderboard.description && leaderboard.description.length > 0 && (
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              {leaderboard.description}
            </p>
          )}

          <div className="flex items-center justify-center gap-6 mt-6 mb-8">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FontAwesomeIcon
                icon={faUsers}
                className="w-4 h-4 text-indigo-600"
              />
              <span>
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FontAwesomeIcon
                icon={faRankingStar}
                className="w-4 h-4 text-purple-600"
              />
              <span>Leaderboard</span>
            </div>
          </div>

          <JoinButton
            code={code}
            leaderboardSlug={leaderboard.slug}
            isLoggedIn={!!user}
            alreadyMember={alreadyMember}
          />

          {!user && (
            <p className="text-[11px] text-gray-600 mt-6">
              Powered by{" "}
              <Link
                href="/"
                className="text-indigo-600/70 hover:text-indigo-600 transition-colors"
              >
                Devpulse
              </Link>{" "}
              &mdash; Track your coding activity &amp; compete
            </p>
          )}
        </div>
      </div>

      {!user && <Footer />}
    </div>
  );
}
