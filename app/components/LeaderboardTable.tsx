import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Database } from "../supabase-types";
import { BADGE_LEGEND_HOURS, getBadgeInfoFromHours } from "@/app/utils/badge";

type LeaderboardMembersRow =
  Database["public"]["Views"]["leaderboard_members_view"]["Row"];

// Supabase-generated types for views are always nullable
// due to the nature of views and
// conservative type generation.
export type NonNullableMember = Omit<
  LeaderboardMembersRow,
  | "user_id"
  | "role"
  | "email"
  | "total_seconds"
  | "languages"
  | "operating_systems"
  | "editors"
> & {
  user_id: string;
  role: string;
  email: string;
  total_seconds: number;
  languages: { name: string }[];
  operating_systems: { name: string }[];
  editors: { name: string }[];
};

function LeaderboardPodium({ topUsers }: { topUsers: { user_id: string; rank: number; email: string | null; hours: number; role: string | null; languages: string[]; os: string; editor: string; }[] }) {
  if (topUsers.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
      {topUsers.map((user, idx) => {
        const rankColor =
          idx === 0
            ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
            : idx === 1
              ? "text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.4)]"
              : "text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.4)]";
        
        const badgeInfo = getBadgeInfoFromHours(user.hours);
        const initial = (user.email?.[0] || "?").toUpperCase();

        return (
          <div
            key={user.user_id}
            className="glass-card p-5 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300"
          >
            {/* Minimal Background Glow based on rank */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 transition-transform group-hover:scale-125 duration-700 ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-300' : 'bg-amber-600'}`} />

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-gray-200 shadow-inner relative">
                    {initial}
                  </div>
                  <div>
                    <div className="font-semibold text-white tracking-tight truncate max-w-[120px] sm:max-w-[140px]">
                      {user.email?.split("@")[0] || "Unknown"}
                    </div>
                    <div className={`mt-1.5 badge-base ${badgeInfo.className}`}>
                      {badgeInfo.icon && (
                        <FontAwesomeIcon icon={badgeInfo.icon} className="w-2.5 h-2.5" />
                      )}
                      {badgeInfo.label}
                    </div>
                  </div>
                </div>
                
                <div className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 backdrop-blur-md shadow-lg ${rankColor}`}>
                    <span className="font-mono text-lg sm:text-xl tracking-tighter leading-none">
                    {idx === 0 ? "01" : idx === 1 ? "02" : "03"}
                  </span>
                </div>
              </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 relative z-10">
              <div className="text-center flex flex-col justify-center">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">
                  Hours
                </span>
                <span className="text-lg font-bold text-white tracking-tighter">
                  {user.hours}
                </span>
              </div>
              <div className="text-center flex flex-col justify-center border-l border-white/5 pl-2">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">
                  Language
                </span>
                <span className="text-sm font-medium text-gray-300 truncate">
                  {user.languages?.[0] || "N/A"}
                </span>
              </div>
              <div className="text-center flex flex-col justify-center border-l border-white/5 pl-2">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 mb-1">
                  Editor
                </span>
                <span className="text-sm font-medium text-gray-300 truncate">
                  {user.editor || "N/A"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import LeaderboardStats from "./leaderboard/LeaderboardStats";

export default function LeaderboardTable({
  members,
  ownerId,
}: {
  members: NonNullableMember[];
  ownerId?: string;
}) {
  const ranked = members
    .sort((a, b) => (b.total_seconds || 0) - (a.total_seconds || 0))
    .map((member, index) => ({
      user_id: member.user_id,
      rank: index + 1,
      email: member.email,
      hours: Math.round((member.total_seconds || 0) / 3600),
      role: member.role,
      languages: (member.languages || []).slice(0, 3).map((l) => l.name),
      os: member.operating_systems?.[0]?.name || "N/A",
      editor: member.editors?.[0]?.name || "N/A",
    }));

  const maxHours = ranked[0]?.hours || 1;
  const formatRank = (rank: number) => rank.toString().padStart(2, "0");

  const getRankColor = (rank: number) => {
    if (rank === 1)
      return "text-yellow-400 font-bold drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]";
    if (rank === 2) return "text-gray-300 font-bold";
    if (rank === 3) return "text-amber-600 font-bold";
    return "text-gray-600 font-medium";
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6">
      

      <LeaderboardStats members={members} />

      <div className="flex-1 min-w-0">
        <LeaderboardPodium topUsers={ranked.slice(0, 3)} />

        {ranked.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <p className="text-gray-500 tracking-tight font-medium">
            No tracking data available yet.
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {/* Header Row (Desktop) */}
          <div className="hidden md:flex items-center px-4 sm:px-6 py-4 border-b border-white/5 bg-white/[0.01] text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <div className="w-12 shrink-0 text-center">Rank</div>
            <div className="flex-1 ml-4 min-w-[150px]">Developer</div>
            <div className="w-40 md:w-48 lg:w-48 xl:w-64">Language</div>
            <div className="w-24 md:w-32 lg:w-32 xl:w-48">Editor</div>
            <div className="w-24 text-right">Hours</div>
          </div>

          {/* List Body */}
          <div className="flex flex-col divide-y divide-white/5">
            {ranked.slice(3).map((user) => {
              const isCurrentUser = user.user_id === ownerId;
              const pct = Math.max(2, (user.hours / maxHours) * 100);
              const badgeInfo = getBadgeInfoFromHours(user.hours);

              return (
                <div
                  key={user.user_id}
                  className={`group relative flex flex-col md:flex-row items-start md:items-center px-4 sm:px-6 py-4 md:py-4 transition-colors hover:bg-white/[0.02] ${
                    isCurrentUser ? "bg-indigo-500/[0.02]" : "bg-transparent"
                  }`}
                >
                  {/* Background Progress Bar */}
                  <div
                    className="absolute left-0 bottom-0 h-[1px] bg-gradient-to-r from-indigo-500/50 to-transparent"
                    style={{ width: `${pct}%` }}
                  />
                  {isCurrentUser && (
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-indigo-500" />
                  )}

                  {/* MOBILE TOP ROW / DESKTOP LEFT FLEX */}
                  <div className="flex items-center w-full md:w-auto md:flex-1 min-w-0 md:min-w-[150px]">
                    {/* Rank */}
                    <div className="w-8 sm:w-12 shrink-0 text-center flex items-center justify-center">
                      <span
                        className={`font-mono text-lg sm:text-xl tracking-tighter ${getRankColor(user.rank)}`}
                      >
                        {formatRank(user.rank)}
                      </span>
                    </div>

                    {/* Profile + Badges */}
                    <div className="flex-1 ml-3 sm:ml-4 min-w-0 flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center text-[10px] sm:text-sm font-semibold text-gray-300 shadow-sm uppercase">
                        {user.email?.charAt(0) || "?"}
                      </div>
                      <div className="flex flex-col min-w-0 gap-1 sm:gap-1.5">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-200 tracking-tight text-sm sm:text-[15px] truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[180px] lg:max-w-[200px] leading-none">
                            {user.email?.split("@")[0] || "Unknown"}
                          </p>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[8px] sm:text-[9px] uppercase font-bold tracking-widest leading-none">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center">
                          <div className={`badge-base ${badgeInfo.className}`}>
                            {badgeInfo.icon && (
                              <FontAwesomeIcon
                                icon={badgeInfo.icon}
                                className="w-2 h-2"
                              />
                            )}
                            {badgeInfo.label}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Score */}
                    <div className="md:hidden shrink-0 ml-3 flex flex-col items-end justify-center">
                      <p className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-none">
                        {user.hours}
                      </p>
                      <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-1">
                        hrs
                      </span>
                    </div>
                  </div>

                  {/* MOBILE BOTTOM STACK / DESKTOP RIGHT ROW */}
                  <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto mt-4 md:mt-0 pl-[2.75rem] sm:pl-[4.25rem] md:pl-0 gap-2.5 md:gap-0">
                      {/* Language */}
                    <div className="flex flex-wrap items-center gap-1.5 w-full md:w-48 lg:w-48 xl:w-64 md:shrink-0 md:pr-4">
                      {user.languages.length > 0 ? (
                        user.languages.map((lang, i) => (
                          <span
                            key={i}
                            className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-white/[0.03] border border-white/5 text-[9px] sm:text-[10px] text-gray-300 font-medium tracking-wide truncate max-w-[70px] sm:max-w-[80px]"
                          >
                            {lang}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] sm:text-xs text-gray-600">
                          No stack tracked
                        </span>
                      )}
                    </div>

                      {/* Editor */}
                    <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-32 lg:w-32 xl:w-48 md:shrink-0">
                      {user.editor !== "N/A" && (
                        <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium truncate max-w-[70px] lg:max-w-[90px]">
                          {user.editor}
                        </span>
                      )}
                      {user.editor !== "N/A" && user.os !== "N/A" && (
                        <span className="w-[3px] h-[3px] rounded-full bg-gray-600 shrink-0"></span>
                      )}
                      {user.os !== "N/A" && (
                        <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium truncate max-w-[70px] lg:max-w-[90px]">
                          {user.os}
                        </span>
                      )}
                    </div>

                    {/* Score (Desktop) */}
                    <div className="hidden md:flex w-24 shrink-0 justify-end items-baseline">
                      <p className="text-2xl font-bold tracking-tight text-white leading-none">
                        {user.hours}
                      </p>
                      <span className="text-xs text-gray-500 font-medium ml-1.5 tracking-normal">
                        hrs
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>

      {/* Rankings Legend */}
      <div className="xl:w-64 shrink-0 mt-8 xl:mt-0 flex flex-col gap-6">
      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 h-fit">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-start gap-2">
          Rankings Legend
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-1 gap-2">
          {BADGE_LEGEND_HOURS.map((hours) => {
            const b = getBadgeInfoFromHours(hours);
            return (
              <div key={hours} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] transition-colors gap-2">
                <div className={`badge-base ${b.className} shrink-0 !text-[9px] !py-0.5 !px-2`}>
                  {b.icon && <FontAwesomeIcon icon={b.icon} className="w-2.5 h-2.5" />}
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
    
      </div>
    </div>
  );
}