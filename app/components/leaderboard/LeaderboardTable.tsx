"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BADGE_LEGEND_HOURS, getBadgeInfoFromHours } from "@/app/utils/badge";
import LeaderboardStats from "./LeaderboardStats";

export interface NonNullableMember {
  user_id: string;
  role: string;
  email: string;
  total_seconds: number;
  languages: { name: string }[];
  operating_systems: { name: string }[];
  editors: { name: string }[];
}

export default function LeaderboardTable({
  members,
}: {
  members: NonNullableMember[];
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

  const formatRank = (rank: number) => rank.toString().padStart(2, "0");

  const getRankColor = (rank: number) => {
    if (rank === 1)
      return "text-yellow-400 font-bold drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]";
    if (rank === 2) return "text-gray-600 font-bold";
    if (rank === 3) return "text-amber-600 font-bold";
    return "text-gray-600 font-medium";
  };

  return (
    <>
      <div className="flex-1 min-w-0">
        {ranked.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <p className="text-gray-500 tracking-tight font-medium">
              No tracking data available yet.
            </p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            {/* Header Row (Desktop) */}
            <div className="hidden md:flex items-center px-4 sm:px-6 py-4 border-b border-gray-200 bg-white/[0.01] text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <div className="w-12 shrink-0 text-center">Rank</div>
              <div className="flex-1 ml-4 min-w-[150px]">Developer</div>
              <div className="w-40 md:w-48 lg:w-48 xl:w-64">Language</div>
              <div className="w-24 md:w-32 lg:w-32 xl:w-48">Editor</div>
              <div className="w-24 text-right">Hours</div>
            </div>

            {/* List Body */}
            <div className="flex flex-col divide-y divide-white/5">
              {ranked.map((user) => {
                const badgeInfo = getBadgeInfoFromHours(user.hours);

                return (
                  <div
                    key={user.user_id}
                    className="group relative flex flex-col md:flex-row items-start md:items-center px-4 sm:px-6 py-4 md:py-4 transition-colors hover:bg-gray-100 bg-transparent"
                  >
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
                        <div className="flex flex-col min-w-0 gap-1 sm:gap-1.5">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-700 tracking-tight text-sm sm:text-[15px] truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[180px] lg:max-w-[200px] leading-none">
                              {user.email?.split("@")[0] || "Unknown"}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center">
                            <div
                              className={`badge-base ${badgeInfo.className}`}
                            >
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
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-none">
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
                              className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-gray-50 border border-gray-200 text-[9px] sm:text-[10px] text-gray-600 font-medium tracking-wide truncate max-w-[70px] sm:max-w-[80px]"
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
                          <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium truncate max-w-[70px] lg:max-w-[90px]">
                            {user.editor}
                          </span>
                        )}
                        {user.editor !== "N/A" && user.os !== "N/A" && (
                          <span className="w-[3px] h-[3px] rounded-full bg-gray-600 shrink-0"></span>
                        )}
                        {user.os !== "N/A" && (
                          <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium truncate max-w-[70px] lg:max-w-[90px]">
                            {user.os}
                          </span>
                        )}
                      </div>

                      {/* Score (Desktop) */}
                      <div className="hidden md:flex w-24 shrink-0 justify-end items-baseline">
                        <p className="text-2xl font-bold tracking-tight text-gray-900 leading-none">
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
    </>
  );
}
