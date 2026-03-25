import { Metadata } from "next";
import { createClient } from "../../lib/supabase/server";
import JoinButton from "./[code]/JoinButton";
import Footer from "@/app/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

async function getLeaderboard(code: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leaderboards")
    .select("id, name, description, slug, owner_id, created_at")
    .eq("join_code", code)
    .single();
  return data;
}

async function getMemberCount(leaderboardId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("leaderboard_members_view")
    .select("*", { count: "exact", head: true })
    .eq("leaderboard_id", leaderboardId);
  return count ?? 0;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { id } = await searchParams;
  const code = (id || "").trim();

  if (!code) {
    return {
      title: "Join - DevPulse",
      description: "Open an invite link to join a DevPulse leaderboard.",
    };
  }

  const leaderboard = await getLeaderboard(code);
  if (!leaderboard) {
    return {
      title: "Invite Not Found - DevPulse",
      description: "This invite link is invalid or has expired.",
    };
  }

  const title = `You're invited to join ${leaderboard.name}!`;
  const description =
    leaderboard.description && leaderboard.description?.length > 0
      ? leaderboard.description
      : `Join the ${leaderboard.name} leaderboard on DevPulse and compete with other developers. Track your coding activity and climb the ranks!`;

  return {
    title: `${title} - DevPulse`,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "DevPulse",
      url: `https://devpulse-waka.vercel.app/join?id=${encodeURIComponent(code)}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function JoinPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const code = (id || "").trim();

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] text-white grid-bg">
        <div className="glass-card p-10 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Join a Leaderboard
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            Open an invite link like{" "}
            <span className="font-mono">/join?id=XXXXXXXX</span>.
          </p>
          <Link href="/" className="btn-primary inline-block px-6 py-3 text-sm">
            Go to DevPulse
          </Link>
        </div>
      </div>
    );
  }

  const leaderboard = await getLeaderboard(code);

  if (!leaderboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] text-white grid-bg">
        <div className="glass-card p-10 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Invite Not Found
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            This invite link is invalid or has expired.
          </p>
          <Link href="/" className="btn-primary inline-block px-6 py-3 text-sm">
            Go to DevPulse
          </Link>
        </div>
      </div>
    );
  }

  const memberCount = await getMemberCount(leaderboard.id);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let alreadyMember = false;
  if (user) {
    const { data: membership } = await supabase
      .from("leaderboard_members")
      .select("id")
      .eq("leaderboard_id", leaderboard.id)
      .eq("user_id", user.id)
      .single();
    alreadyMember = !!membership;
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white grid-bg relative overflow-hidden">
      <div className="glow-orb w-[500px] h-[500px] bg-indigo-600/20 top-[-200px] left-1/2 -translate-x-1/2 absolute" />
      <div className="glow-orb w-[300px] h-[300px] bg-purple-600/15 bottom-[-100px] right-[-50px] absolute" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <div className="glass-card max-w-lg w-full p-8 md:p-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.15)]">
              <Image src="/logo.svg" alt="DevPulse" width={36} height={36} />
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-semibold mb-3">
            {alreadyMember
              ? "You\u2019re already a member of"
              : "You\u2019ve been invited to"}
          </p>

          <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">
            {leaderboard.name}
          </h1>

          {leaderboard.description && leaderboard.description.length > 0 && (
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              {leaderboard.description}
            </p>
          )}

          <div className="flex items-center justify-center gap-6 mt-6 mb-8">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <svg
                className="w-4 h-4 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <svg
                className="w-4 h-4 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
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
                className="text-indigo-400/70 hover:text-indigo-400 transition-colors"
              >
                DevPulse
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
