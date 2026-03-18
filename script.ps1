$file = "app\components\LeaderboardTable.tsx"
$content = Get-Content $file -Raw
$pattern = '(?s)\{ranked.length === 0 \? \(.+</div\>\s*\)\s*:\s*\(\s*<div className="glass-card overflow-hidden">.*?\n        </div>\s*\)\}\s*</div>\s*\);\s*}'
$replacement = @'
{ranked.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-gray-500 tracking-tight font-medium">No tracking data available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ranked.map((user) => {
            const isCurrentUser = user.user_id === ownerId;
            const pct = Math.max(2, (user.hours / maxHours) * 100);
            const badgeInfo = getBadgeInfo(user.rank, user.hours);

            return (
              <div
                key={user.user_id}
                className={`glass-card p-5 relative overflow-hidden flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300 ${
                  isCurrentUser ? "ring-1 ring-indigo-500/50 bg-indigo-500/[0.02]" : ""
                }`}
              >
                {/* Background Progress Bar */}
                <div
                  className="absolute left-0 bottom-0 top-0 w-1 bg-gradient-to-t from-indigo-500/50 to-transparent opacity-30"
                />

                {/* Header: Rank + Score */}
                <div className="flex justify-between items-start w-full relative z-10">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-3xl tracking-tighter leading-none ${getRankColor(user.rank)}`}>
                      #{formatRank(user.rank)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-bold text-xl text-white tracking-tight leading-none bg-white/5 py-1.5 px-3 rounded-lg border border-white/5 shadow-inner flex items-baseline gap-1">
                      {user.hours} <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">hrs</span>
                    </div>
                  </div>
                </div>

                {/* Profile row */}
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-gray-200 shadow-xl uppercase">
                    {user.email.charAt(0)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-200 tracking-tight text-[15px] truncate max-w-[140px] leading-tight">
                        {user.email.split("@")[0]}
                      </h3>
                      {isCurrentUser && (
                        <span className="px-1.5 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[8px] uppercase font-bold tracking-widest leading-none">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <div className={`badge-base ${badgeInfo.class}`}>
                        {badgeInfo.icon && <FontAwesomeIcon icon={badgeInfo.icon} className="w-2 h-2" />}
                        {badgeInfo.label}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tech Stack & Env */}
                <div className="flex flex-col gap-2.5 mt-1 pt-4 border-t border-white/5 relative z-10">
                  {/* Tech Stack */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Stack</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {user.languages.length > 0 ? (
                        user.languages.map((lang, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/5 text-[10px] text-gray-300 font-medium tracking-wide">
                            {lang}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-600">No stack tracked</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Environment */}
                  <div className="flex items-center gap-2 pt-1">
                    {user.editor !== "N/A" && (
                      <span className="text-[10px] text-gray-400 font-medium bg-white/[0.02] px-2 py-0.5 rounded flex items-center justify-center border border-white/5 truncate max-w-[100px]">
                        {user.editor}
                      </span>
                    )}
                    {user.os !== "N/A" && (
                      <span className="text-[10px] text-gray-400 font-medium bg-white/[0.02] px-2 py-0.5 rounded flex items-center justify-center border border-white/5 truncate max-w-[100px]">
                        {user.os}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
