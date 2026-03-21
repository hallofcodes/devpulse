import BackButton from "@/app/components/leaderboard/BackButton";
import { createClient } from "../../lib/supabase/server";
import Footer from "@/app/components/layout/Footer";
import CTA from "@/app/components/layout/CTA";
import Image from "next/image";

export default async function Leaderboards() {
  const supabase = await createClient();

  const [leaderboardsResult, userResult] = await Promise.all([
    supabase
      .from("leaderboards")
      .select("id, name, slug")
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  const { data, error } = leaderboardsResult;
  const { data: user } = userResult;

  if (error) {
    return (
      <div className="glass-card h-full flex items-center justify-center">
        <p className="text-gray-400">Failed to load leaderboards.</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card h-full flex items-center justify-center">
        <p className="text-gray-400">No leaderboards found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white grid-bg relative">
      <div className="max-w-5xl mx-auto p-6 md:p-10 relative z-10">
        <BackButton />

        <div className="flex justify-center items-center gap-3 mb-8">
          <Image src="/logo.svg" alt="DevPulse Logo" width={36} height={36} />
          <h1 className="text-3xl font-bold text-white">
            DevPulse Leaderboards
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map(
            (board: { id: string; name: string; slug: string }, i: number) => (
              <a
                key={board.id}
                href={`/leaderboard/${board.slug}`}
                className="stat-card flex justify-between items-center px-6 py-4 group bg-black/20 hover:bg-white/5 transition-all border border-white/5 rounded-xl rounded-tl-sm hover:border-indigo-500/30"
                data-aos="fade-up"
                data-aos-delay={(i * 50).toString()}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover:shadow-[0_0_10px_rgba(99,102,241,0.8)] transition-all" />
                  <span className="text-gray-200 font-semibold group-hover:text-white transition">
                    {board.name}
                  </span>
                </div>
                <span className="text-gray-500 text-sm group-hover:text-indigo-400 transition flex items-center gap-2">
                  View{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </span>
              </a>
            ),
          )}
        </div>
      </div>

      {!user && <CTA />}
      <Footer />
    </div>
  );
}
