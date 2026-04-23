import { Metadata } from "next";
import { createClient } from "../../lib/supabase/server";
import JoinButton from "./[code]/JoinButton";
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
            <FontAwesomeIcon
              icon={faCircleInfo}
              className="w-8 h-8 text-indigo-400"
            />
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
            <FontAwesomeIcon
              icon={faCircleXmark}
              className="w-8 h-8 text-red-400"
            />
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
      .maybeSingle();
    alreadyMember = user.id === leaderboard.owner_id || !!membership;
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
              <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-indigo-400" />
              <span>
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <FontAwesomeIcon
                icon={faRankingStar}
                className="w-4 h-4 text-purple-400"
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
