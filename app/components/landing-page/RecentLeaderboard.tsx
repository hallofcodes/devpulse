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
  const visibleLeaderboards = leaderboards.slice(0, 6);
  const featuredBoard = visibleLeaderboards[0];
  const arenaBoards = visibleLeaderboards.slice(1);

  return (
    <>
      {leaderboards && leaderboards.length > 0 && (
        <section className="max-x-7xl mx-auto px-6 pb-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Active Leaderboards
              </h2>
              <p className="text-gray-500 text-sm md:text-base max-w-2xl">
                Live competition spaces where teams and individuals race on
                coding consistency.
              </p>
            </div>
          </div>

          {featuredBoard && (
            <Link
              href={`/leaderboard/${featuredBoard.slug}`}
              className="block glass-card rounded-3xl border-gray-200 bg-gray-50 p-6 mb-4 group hover:border-blue-500/20 transition-colors"
            >
              <div>
                <span className="inline-flex items-center rounded-md border border-blue-400 bg-blue-500 px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] text-white font-semibold mb-3">
                  Featured Leaderboard
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {featuredBoard.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Most recently launched board with open competition access.
                </p>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {arenaBoards.map(
              (
                board: { id: string; name: string; slug: string },
                i: number,
              ) => (
                <Link
                  key={board.id}
                  href={`/leaderboard/${board.slug}`}
                  className="rounded-2xl glass-card border-gray-200 bg-gray-50 p-4 group hover:bg-white/[0.035] hover:border-blue-500/20 transition-all"

                  data-aos-delay={(i * 60).toString()}
                >
                  <span className="mb-3 inline-flex items-center rounded-md border border-blue-400 bg-blue-500 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-white font-semibold">
                    Leaderboard #{i + 2}
                  </span>

                  <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {board.name}
                  </h4>

                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full bg-blue-400/90"
                      style={{ width: `${Math.max(35, 100 - i * 12)}%` }}
                    />
                  </div>

                  <span className="text-gray-500 text-xs truncate pr-2">
                    /leaderboard/{board.slug}
                  </span>
                </Link>
              ),
            )}
          </div>

          {arenaBoards.length === 0 && featuredBoard && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-5">
              <p className="text-sm text-gray-500">
                New boards will appear here as your community creates more
                competition arenas.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              href="/leaderboard"
              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-500/20 rounded-lg text-sm font-medium transition-colors"
            >
              View all leaderboards
            </Link>
            <Link
              href="/join"
              className="px-4 py-2 border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
            >
              Join with invite code
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
