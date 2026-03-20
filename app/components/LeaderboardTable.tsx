import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCode, faTerminal, faServer, faBolt, faFire, faStar, faRocket } from "@fortawesome/free-solid-svg-icons";

type Member = {
  user_id: string;
  role: string;
  email: string;
  total_seconds: number;
  languages: { name: string }[] | null;
  operating_systems: { name: string }[] | null;
  editors: { name: string }[] | null;
};

function LeaderboardStats({ members }: { members: Member[] }) {
  const totalHours = Math.round(
    members.reduce((acc, m) => acc + (m.total_seconds || 0), 0) / 3600,
  );

  const languageCount: Record<string, number> = {};
  const editorCount: Record<string, number> = {};
  const osCount: Record<string, number> = {};

  members.forEach((m) => {
    (m.languages || []).forEach((l) => {
      languageCount[l.name] = (languageCount[l.name] || 0) + 1;
    });
    (m.editors || []).forEach((e) => {
      editorCount[e.name] = (editorCount[e.name] || 0) + 1;
    });
    (m.operating_systems || []).forEach((os) => {
      osCount[os.name] = (osCount[os.name] || 0) + 1;
    });
  });

  const topLanguage = Object.entries(languageCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const topEditor = Object.entries(editorCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const topOS = Object.entries(osCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 drop-shadow-xl border-white/5">
      <div className="glass-card p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl transition-transform group-hover:scale-125 duration-500" />
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faClock} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-400" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">Total Time</span>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {totalHours} <span className="text-xs sm:text-sm font-medium text-gray-500 tracking-normal">hrs</span>
        </div>
      </div>

      <div className="glass-card p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl transition-transform group-hover:scale-125 duration-500" />
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faCode} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">Top Lang</span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate mt-1">
          {topLanguage}
        </div>
      </div>

      <div className="glass-card p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl transition-transform group-hover:scale-125 duration-500" />
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faTerminal} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">Editor</span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate mt-1">
          {topEditor}
        </div>
      </div>

      <div className="glass-card p-4 sm:p-5 relative overflow-hidden group">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl transition-transform group-hover:scale-125 duration-500" />
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faServer} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">OS</span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate mt-1">
          {topOS}
        </div>
      </div>
    </div>
  );
}

const getBadgeInfo = (rank: number, hours: number) => {
  if (rank === 1) return { label: "GOD LEVEL", class: "badge-god", icon: faBolt };
  if (rank === 2) return { label: "ELITE", class: "badge-elite", icon: faFire };
  if (rank === 3) return { label: "PRO", class: "badge-pro", icon: faStar };
  if (hours > 100) return { label: "MASTER", class: "badge-master", icon: faRocket };
  if (hours > 20) return { label: "HUSTLER", class: "badge-hustler", icon: null };
  return { label: "NOVICE", class: "badge-novice", icon: null };
};

export default function LeaderboardTable({
  members,
  ownerId,
}: {
  members: Member[];
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
    if (rank === 1) return "text-yellow-400 font-bold drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]";
    if (rank === 2) return "text-gray-300 font-bold";
    if (rank === 3) return "text-amber-600 font-bold";
    return "text-gray-600 font-medium";
  };

  return (
    <div className="w-full">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer-bg {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .badge-base {
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.5rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          line-height: normal;
        }
        .badge-god {
          background: linear-gradient(90deg, rgba(234,179,8,0.15) 0%, rgba(253,224,71,0.6) 50%, rgba(234,179,8,0.15) 100%);
          background-size: 200% auto;
          animation: shimmer-bg 2s linear infinite;
          border: 1px solid rgba(250,204,21,0.6);
          color: #fef08a;
          box-shadow: 0 0 10px rgba(250,204,21,0.3);
        }
        .badge-elite {
          background: linear-gradient(90deg, rgba(148,163,184,0.15) 0%, rgba(241,245,249,0.5) 50%, rgba(148,163,184,0.15) 100%);
          background-size: 200% auto;
          animation: shimmer-bg 2.5s linear infinite;
          border: 1px solid rgba(203,213,225,0.5);
          color: #ffffff;
          box-shadow: 0 0 10px rgba(203,213,225,0.2);
        }
        .badge-pro {
          background: linear-gradient(90deg, rgba(217,119,6,0.15) 0%, rgba(252,211,77,0.5) 50%, rgba(217,119,6,0.15) 100%);
          background-size: 200% auto;
          animation: shimmer-bg 3s linear infinite;
          border: 1px solid rgba(217,119,6,0.5);
          color: #fce68a;
          box-shadow: 0 0 10px rgba(217,119,6,0.2);
        }
        .badge-master {
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.4);
          color: #a5b4fc;
        }
        .badge-hustler {
          background: rgba(59,130,246,0.15);
          border: 1px solid rgba(59,130,246,0.4);
          color: #93c5fd;
        }
        .badge-novice {
          background: rgba(107,114,128,0.15);
          border: 1px solid rgba(107,114,128,0.4);
          color: #d1d5db;
        }
      `}} />
      <LeaderboardStats members={members} />

      {ranked.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-gray-500 tracking-tight font-medium">No tracking data available yet.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {/* Header Row (Desktop) */}
          <div className="hidden md:flex items-center px-4 sm:px-6 py-4 border-b border-white/5 bg-white/[0.01] text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <div className="w-12 shrink-0 text-center">Rank</div>
            <div className="flex-1 ml-4">Developer</div>
            <div className="w-48 lg:w-72 xl:w-80">Tech Stack</div>
            <div className="w-32 lg:w-48">Environment</div>
            <div className="w-24 text-right">Score</div>
          </div>

          {/* List Body */}
          <div className="flex flex-col divide-y divide-white/5">
            {ranked.map((user) => {
              const isCurrentUser = user.user_id === ownerId;
              const pct = Math.max(2, (user.hours / maxHours) * 100);
              const badgeInfo = getBadgeInfo(user.rank, user.hours);

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
                  <div className="flex items-center w-full md:w-auto md:flex-1 min-w-0">
                    {/* Rank */}
                    <div className="w-8 sm:w-12 shrink-0 text-center flex items-center justify-center">
                      <span className={`font-mono text-lg sm:text-xl tracking-tighter ${getRankColor(user.rank)}`}>
                        {formatRank(user.rank)}
                      </span>
                    </div>

                    {/* Profile + Badges */}
                    <div className="flex-1 ml-3 sm:ml-4 min-w-0 flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center text-[10px] sm:text-sm font-semibold text-gray-300 shadow-sm uppercase">
                        {user.email.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0 gap-1 sm:gap-1.5">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-200 tracking-tight text-sm sm:text-[15px] truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[180px] lg:max-w-[200px] leading-none">
                            {user.email.split("@")[0]}
                          </p>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[8px] sm:text-[9px] uppercase font-bold tracking-widest leading-none">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center">
                          <div className={`badge-base ${badgeInfo.class}`}>
                            {badgeInfo.icon && <FontAwesomeIcon icon={badgeInfo.icon} className="w-2 h-2" />}
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
                       <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-1">hrs</span>
                    </div>
                  </div>

                  {/* MOBILE BOTTOM STACK / DESKTOP RIGHT ROW */}
                  <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto mt-4 md:mt-0 pl-[2.75rem] sm:pl-[4.25rem] md:pl-0 gap-2.5 md:gap-0">
                    {/* Tech Stack */}
                    <div className="flex flex-wrap items-center gap-1.5 w-full md:w-48 lg:w-72 xl:w-80 md:shrink-0 md:pr-4">
                      {user.languages.length > 0 ? (
                        user.languages.map((lang, i) => (
                          <span key={i} className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-white/[0.03] border border-white/5 text-[9px] sm:text-[10px] text-gray-300 font-medium tracking-wide truncate max-w-[70px] sm:max-w-[80px]">
                            {lang}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] sm:text-xs text-gray-600">No stack tracked</span>
                      )}
                    </div>

                    {/* Environment */}
                    <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-32 lg:w-48 md:shrink-0">
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
                      <span className="text-xs text-gray-500 font-medium ml-1.5 tracking-normal">hrs</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
