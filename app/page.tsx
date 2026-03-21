import Link from "next/link";
import Image from "next/image";
import { createClient } from "./lib/supabase/server";
import Footer from "./components/layout/Footer";
import CTA from "./components/layout/CTA";
import Contributors from "./components/landing-page/Contributors";
import LosserMembers from "./components/landing-page/LosserMembers";
import RecentLeaderboard from "./components/landing-page/RecentLeaderboard";
import TopLeaderboard, {
  TopMember,
} from "./components/landing-page/TopLeaderbord";
import ContributeCard from "./components/landing-page/ContributeCard";
import VibeCoders from "./components/landing-page/VibeCoders";

export default async function Home() {
  const supabase = await createClient();

  const [leaderboardsRes, losserMembersRes, topMembersRes] = await Promise.all([
    supabase
      .from("leaderboards")
      .select("id, name, slug")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("top_user_stats")
      .select("*")
      .lt("total_seconds", 14400) // thats 4 hours
      .neq("total_seconds", 0)
      .not("total_seconds", "is", null)
      .order("total_seconds", { ascending: true })
      .limit(50),
    supabase
      .from("top_user_stats")
      .select("*")
      .neq("total_seconds", 0)
      .not("total_seconds", "is", null)
      .order("total_seconds", { ascending: false })
      .limit(50),
  ]);

  const leaderboards = leaderboardsRes.data ?? [];
  const losser_members = losserMembersRes.data ?? [];
  const top_members = topMembersRes.data ?? [];

  const topMembers: TopMember[] = top_members
    ? top_members.filter(
        (u): u is { email: string; total_seconds: number; user_id: string } =>
          u.email !== null && u.total_seconds !== null && u.user_id !== null,
      )
    : [];

  const losserMembers: TopMember[] = losser_members
    ? losser_members.filter(
        (u): u is { email: string; total_seconds: number; user_id: string } =>
          u.email !== null && u.total_seconds !== null && u.user_id !== null,
      )
    : [];

  const topVibeCoders: TopMember[] = topMembers
    .filter((member): member is TopMember =>
      member.categories
        ? member.categories?.some(
            (cat) => cat.name === "AI Coding" && cat.total_seconds > 0,
          ) &&
          member.email !== null &&
          member.total_seconds !== null
        : false,
    )
    .map((member) => {
      const codingCategory = member.categories
        ? member.categories.find((cat) => cat.name === "AI Coding")
        : undefined;

      return codingCategory
        ? { ...member, total_seconds: codingCategory.total_seconds }
        : member;
    });

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden grid-bg relative">
      {/* Header / Nav */}
      <header className="absolute top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition"
            data-aos="fade-down"
          >
            <Image src="/logo.svg" alt="DevPulse Logo" width={36} height={36} />
            <span className="text-xl font-bold tracking-tight text-white">
              DevPulse
            </span>
          </Link>

          <div
            className="flex items-center gap-6 text-sm font-medium"
            data-aos="fade-down"
            data-aos-delay="100"
          >
            <Link
              href="/login"
              className="text-gray-300 hover:text-white transition"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/5 px-6 py-2.5 rounded-full transition-all shadow-lg backdrop-blur-md"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-32 lg:pt-40 pb-20 lg:pb-32 flex flex-col lg:flex-row items-center gap-16 min-h-[85vh]">
        {/* Left text */}
        <div className="w-full lg:w-1/2 text-center lg:text-left z-10">
          <a
            href="https://github.com/mrepol742/devpulse"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold uppercase tracking-widest mb-8 group"
            data-aos="fade-right"
          >
            <svg
              className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Star on GitHub
          </a>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-6"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Measure your <br />
            <span className="gradient-text">coding pulse.</span>
          </h1>

          <p
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Turn your daily coding activity into competitive, shareable
            leaderboards. Track productivity, motivate your team, and visualize
            real developer impact.
          </p>

          <div
            className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <Link
              href="/signup"
              className="btn-primary px-8 py-3.5 text-base md:text-lg"
            >
              Start Tracking Free
            </Link>
            <a
              href="#features"
              className="btn-secondary px-8 py-3.5 text-base md:text-lg"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Right abstract UI visual / Mockup */}
        <div className="w-full lg:w-1/2 relative h-[400px] lg:h-[500px] hidden md:block z-10 perspective-1000">
          {/* Card 1 */}
          <div
            className="absolute top-0 right-10 lg:right-0 w-[320px] glass-card p-5 border-white/10 shadow-2xl skew-y-3 -rotate-3 transition-transform duration-700 hover:rotate-0 hover:skew-y-0"
            style={{ transformStyle: "preserve-3d" }}
            data-aos="fade-left"
            data-aos-delay="200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                Total Coding
              </div>
              <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                +18%
              </div>
            </div>
            <div className="text-4xl font-extrabold text-white mb-2">
              42h 15m
            </div>
            <div className="text-xs text-gray-500 mb-4">Last 7 days</div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-3/4 rounded-full" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="absolute top-44 left-10 lg:-left-10 w-[280px] glass-card p-5 border-white/10 shadow-2xl -skew-y-3 rotate-3 z-20 backdrop-blur-xl bg-[#0f0f28]/80 transition-transform duration-700 hover:rotate-0 hover:skew-y-0 text-left"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">
              Top Languages
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[#3178c6]/20 flex items-center justify-center text-[#3178c6] font-bold text-xs">
                  TS
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-white">TypeScript</span>
                    <span className="text-gray-400 font-mono text-xs">
                      28h 40m
                    </span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3178c6] w-[70%]" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[#61dafb]/20 flex items-center justify-center text-[#61dafb] font-bold text-xs">
                  Re
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-white">React</span>
                    <span className="text-gray-400 font-mono text-xs">
                      12h 10m
                    </span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#61dafb] w-[30%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 (Code terminal) */}
          <div
            className="absolute bottom-5 right-20 w-[300px] glass-card p-4 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30 bg-[#050510]/90 transition-transform duration-700 hover:-translate-y-2 text-left"
            data-aos="fade-up"
            data-aos-delay="600"
          >
            <div className="flex gap-1.5 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="font-mono text-[13px] leading-relaxed">
              <span className="text-purple-400">import</span>{" "}
              <span className="text-gray-300">{"{ Pulse }"}</span>{" "}
              <span className="text-purple-400">from</span>{" "}
              <span className="text-green-400">&apos;devpulse&apos;</span>;
              <br />
              <br />
              <span className="text-blue-400">Pulse</span>.
              <span className="text-yellow-200">syncWakaTime</span>(
              <span className="text-gray-300">key</span>).
              <span className="text-yellow-200">then</span>(
              <span className="text-blue-300">stats</span>{" "}
              <span className="text-purple-400">=&gt;</span> {"{"}
              <br />
              &nbsp;&nbsp;<span className="text-blue-400">console</span>.
              <span className="text-yellow-200">log</span>(
              <span className="text-green-400">&quot;Leveling up!&quot;</span>);
              <br />
              {"}"});
            </div>
          </div>
        </div>
      </section>

      {/* Features Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-6 py-24 lg:py-32 relative z-10"
      >
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            data-aos="fade-up"
          >
            Everything you need to grow.
          </h2>
          <p
            className="text-gray-400 text-lg max-w-2xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            DevPulse integrates seamlessly with your tools to provide accurate,
            transparent metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={
              <svg
                className="w-6 h-6 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
            title="Private & Public Boards"
            description="Create private boards for your engineering team or open public leaderboards to compete with the entire community."
            delay="0"
          />
          <FeatureCard
            icon={
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
            title="Real-Time Integrations"
            description="Sync your WakaTime data automatically via custom proxy APIs. No manual entry, just pure coding time."
            delay="100"
          />
          <FeatureCard
            icon={
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            title="Team Collaboration"
            description="Invite teammates, compare daily averages, dissect language usage, and foster a healthy culture of productivity."
            delay="200"
          />
        </div>
      </section>

      <TopLeaderboard top_members={topMembers ?? []} />
      <RecentLeaderboard leaderboards={leaderboards ?? []} />
      <LosserMembers losser_members={losserMembers ?? []} />
      <VibeCoders vibe_coders={topVibeCoders ?? []} />
      <Contributors />
      <CTA />
      <ContributeCard />
      <Footer />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div
      className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300 bg-white/[0.02] border-white/5 hover:border-indigo-500/20"
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
