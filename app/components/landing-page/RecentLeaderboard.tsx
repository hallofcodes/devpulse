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
        <section
          className="max-w-5xl mx-auto px-6 pb-8 relative z-10"
         
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-blue-600/90 font-semibold mb-3">
                Board Arena
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Active Leaderboards
              </h2>
              <p className="text-gray-500 text-sm md:text-base max-w-2xl">
                Live competition spaces where teams and individuals race on
                coding consistency.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {leaderboards.length} active boards
              </span>
              <Link
                href="/signup"
                className="text-sm text-blue-600 hover:text-blue-600 font-medium flex items-center gap-1 group"
              >
                Create yours
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
          </div>

          {featuredBoard && (
            <Link
              href={`/leaderboard/${featuredBoard.slug}`}
              className="block glass-card rounded-3xl border-gray-200 bg-gray-50 p-6 mb-4 group hover:border-blue-500/20 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <span className="inline-flex items-center rounded-md border border-blue-400/30 bg-blue-50 px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] text-blue-200 font-semibold mb-3">
                    Featured Arena
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-blue-200 transition-colors mb-1">
                    {featuredBoard.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Most recently launched board with open competition access.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 min-w-[260px]">
                  <div className="rounded-xl border border-gray-200 bg-white/[0.01] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-gray-500 mb-1">
                      Status
                    </p>
                    <p className="text-xs font-semibold text-blue-600">
                      Live
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white/[0.01] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-gray-500 mb-1">
                      Access
                    </p>
                    <p className="text-xs font-semibold text-gray-900">Public</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white/[0.01] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-gray-500 mb-1">
                      Action
                    </p>
                    <p className="text-xs font-semibold text-blue-200">
                      Enter
                    </p>
                  </div>
                </div>
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
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center rounded-md border border-blue-400/30 bg-blue-50 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-blue-200 font-semibold">
                      Arena #{i + 2}
                    </span>
                    <span className="text-[11px] text-gray-500 uppercase tracking-[0.1em]">
                      Open
                    </span>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-200 transition-colors mb-2 line-clamp-2">
                    {board.name}
                  </h4>

                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full bg-blue-400/90"
                      style={{ width: `${Math.max(35, 100 - i * 12)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 truncate pr-2">
                      /leaderboard/{board.slug}
                    </span>
                    <span className="text-blue-600 font-semibold whitespace-nowrap">
                      Enter →
                    </span>
                  </div>
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

          <div className="h-px w-full mt-8 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>
      )}
    </>
  );
}
