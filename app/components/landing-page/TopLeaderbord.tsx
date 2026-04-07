import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BADGE_LEGEND_HOURS, getBadgeInfoFromHours } from "@/app/utils/badge";

export interface TopMember {
  email: string;
  total_seconds: number;
  categories: { name: string; total_seconds: number }[] | null;
  user_id: string | null;
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function formatRank(rank: number) {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank}th`;
}

function rankBadgeClasses(rank: number) {
  if (rank === 1) {
    return "border-yellow-400/50 bg-yellow-500/20 text-yellow-200";
  }
  if (rank === 2) {
    return "border-slate-300/40 bg-slate-300/10 text-slate-200";
  }
  if (rank === 3) {
    return "border-amber-500/40 bg-amber-500/10 text-amber-200";
  }
  return "border-white/15 bg-white/5 text-gray-300";
}

export default function TopLeaderboard({
  top_members,
}: {
  top_members: TopMember[];
}) {
  const rankedTopMembers = top_members.slice(0, 10);

  return (
    <>
      {top_members && top_members.length > 0 && (
        <section
          className="max-w-5xl mx-auto px-6 pb-8 relative z-10"
          data-aos="fade-up"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-indigo-300/90 font-semibold mb-3">
                Real Leaderboard
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Top Developers of the Week
              </h2>
              <p className="text-gray-400 text-sm md:text-base max-w-2xl">
                Ranked by weekly coding time with clear podium cutoffs and
                progress to the top.
              </p>
            </div>
            <div className="inline-flex items-center rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              {rankedTopMembers.length} ranked developers
            </div>
          </div>

          <div className="glass-card border-white/5 bg-white/[0.015] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[72px_minmax(0,1fr)_110px] md:grid-cols-[72px_minmax(0,1fr)_120px_180px] gap-3 px-4 py-3 border-b border-white/5 bg-white/[0.01]">
              <span className="text-[11px] uppercase tracking-[0.12em] text-gray-500 font-semibold">
                Rank
              </span>
              <span className="text-[11px] uppercase tracking-[0.12em] text-gray-500 font-semibold">
                Developer
              </span>
              <span className="text-[11px] uppercase tracking-[0.12em] text-gray-500 font-semibold text-right md:text-left">
                Time
              </span>
              <span className="hidden md:block text-[11px] uppercase tracking-[0.12em] text-gray-500 font-semibold">
                Rank Badge
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {rankedTopMembers.map((member, i) => {
                const rank = i + 1;
                const badgeInfo = getBadgeInfoFromHours(member.total_seconds / 3600);

                return (
                  <div
                    key={`${member.email}-${rank}`}
                    className="grid grid-cols-[72px_minmax(0,1fr)_110px] md:grid-cols-[72px_minmax(0,1fr)_120px_180px] gap-3 items-center px-4 py-3 transition-colors bg-white/[0.01] hover:bg-white/[0.03]"
                    data-aos="fade-up"
                    data-aos-delay={(i * 45).toString()}
                  >
                    <span
                      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md border text-[11px] font-bold ${rankBadgeClasses(rank)}`}
                    >
                      {formatRank(rank)}
                    </span>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {member.email.split("@")[0]}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.1em] text-gray-500">
                        {rank <= 3 ? "Podium zone" : "Chasing podium"}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-gray-200 text-right md:text-left whitespace-nowrap">
                      {formatDuration(member.total_seconds)}
                    </span>

                    <div className="hidden md:flex md:justify-start">
                      <div
                        className={`badge-base ${badgeInfo.className} shrink-0 !text-[9px] !py-0.5 !px-2`}
                      >
                        {badgeInfo.icon && (
                          <FontAwesomeIcon
                            icon={badgeInfo.icon}
                            className="w-2.5 h-2.5"
                          />
                        )}
                        {badgeInfo.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card mt-6 p-5 rounded-2xl border-white/5 bg-white/[0.015]">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Rankings Legend
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {BADGE_LEGEND_HOURS.map((hours) => {
                const b = getBadgeInfoFromHours(hours);
                return (
                  <div
                    key={hours}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-colors gap-2"
                  >
                    <div
                      className={`badge-base ${b.className} shrink-0 !text-[9px] !py-0.5 !px-2`}
                    >
                      {b.icon && (
                        <FontAwesomeIcon icon={b.icon} className="w-2.5 h-2.5" />
                      )}
                      {b.label}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono font-medium">
                      {hours === 0 ? "0 hrs" : `${hours}+`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {top_members.length > rankedTopMembers.length && (
            <p className="text-gray-500 text-xs mt-4">
              Showing top {rankedTopMembers.length} developers for a cleaner
              weekly snapshot.
            </p>
          )}

          <div className="h-px w-full mt-8 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>
      )}
    </>
  );
}
