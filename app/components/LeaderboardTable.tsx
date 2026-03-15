type Member = {
  user_id: string;
  role: string;
  email: string;
  total_seconds: number;
  languages: { name: string }[];
  operating_systems: { name: string }[];
  editors: { name: string }[];
};

function LeaderboardStats({ members }: { members: Member[] }) {
  const totalHours = Math.round(
    members.reduce((acc, m) => acc + (m.total_seconds || 0), 0) / 3600,
  );

  const languageCount: Record<string, number> = {};
  const editorCount: Record<string, number> = {};
  const osCount: Record<string, number> = {};

  members.forEach((m) => {
    m.languages.forEach((l) => {
      languageCount[l.name] = (languageCount[l.name] || 0) + 1;
    });
    m.editors.forEach((e) => {
      editorCount[e.name] = (editorCount[e.name] || 0) + 1;
    });
    m.operating_systems.forEach((os) => {
      osCount[os.name] = (osCount[os.name] || 0) + 1;
    });
  });

  const languageEntries = Object.entries(languageCount).filter(
    ([_, count]) => count > 0,
  );
  const topLanguage =
    languageEntries.sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const leastLanguage =
    languageEntries.sort((a, b) => b[1] - a[1]).slice(-1)[0]?.[0] || "N/A";

  const topEditor =
    Object.entries(editorCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const topOS =
    Object.entries(osCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
      <div className="stat-card text-center">
        <p className="text-2xl font-bold text-white">{totalHours}</p>
        <p className="text-xs text-indigo-400 mt-1 uppercase tracking-wider">Total Hours</p>
      </div>
      <div className="stat-card text-center">
        <p className="text-lg font-bold text-white truncate">{topLanguage}</p>
        <p className="text-xs text-indigo-400 mt-1 uppercase tracking-wider">Top Language</p>
      </div>
      <div className="stat-card text-center">
        <p className="text-lg font-bold text-white truncate">{leastLanguage}</p>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Least Language</p>
      </div>
      <div className="stat-card text-center">
        <p className="text-lg font-bold text-white truncate">{topEditor}</p>
        <p className="text-xs text-indigo-400 mt-1 uppercase tracking-wider">Top Editor</p>
      </div>
      <div className="stat-card text-center">
        <p className="text-lg font-bold text-white truncate">{topOS}</p>
        <p className="text-xs text-indigo-400 mt-1 uppercase tracking-wider">Top OS</p>
      </div>
    </div>
  );
}

export default function LeaderboardTable({
  members,
  isOwner,
  ownerId,
}: {
  members: Member[];
  isOwner: boolean;
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
      languages: member.languages
        .slice(0, 3)
        .map((l) => l.name)
        .join(", "),
      os: member.operating_systems[0]?.name || "N/A",
      editor: member.editors[0]?.name || "N/A",
    }));

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div>
      <LeaderboardStats members={members} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map((user) => (
          <div
            key={user.email}
            className={`glass-card p-5 ${
              user.user_id === ownerId
                ? "!border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                : ""
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-bold text-indigo-400">
                {getRankBadge(user.rank)}
              </span>

              <span className="text-sm text-gray-500 font-medium">
                {user.hours} hrs
              </span>
            </div>

            <p className="font-semibold text-white mb-4 truncate text-sm">
              {user.email}
            </p>

            <div className="space-y-1.5 text-sm">
              <p className="text-gray-400">
                <span className="text-gray-600">Languages:</span>{" "}
                <span className="text-gray-300">
                  {user.languages.length > 0 ? user.languages : "N/A"}
                </span>
              </p>

              <p className="text-gray-400">
                <span className="text-gray-600">OS:</span>{" "}
                <span className="text-gray-300">{user.os}</span>
              </p>

              <p className="text-gray-400">
                <span className="text-gray-600">Editor:</span>{" "}
                <span className="text-gray-300">{user.editor}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
