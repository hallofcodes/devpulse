import Link from "next/link";

export interface RecentLeaderboardProps {
  id: string;
  name: string;
  slug: string;
}

export default function RecentLeaderboard({
  leaderboards,
}: {
  leaderboards: RecentLeaderboardProps[];
}) {
  return (
    <>
      {leaderboards && leaderboards.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-5 relative z-10">
          <div
            className="glass-card border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 rounded-3xl"
            data-aos="fade-up"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Active Leaderboards
                </h2>
                <p className="text-gray-400 text-sm">
                  Join the top engineering communities today.
                </p>
              </div>
              <Link
                href="/signup"
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 group"
              >
                Create yours{" "}
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leaderboards.map(
                (
                  board: { id: string; name: string; slug: string },
                  i: number,
                ) => (
                  <Link
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
                      View
                      <svg
                        className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </Link>
                ),
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
