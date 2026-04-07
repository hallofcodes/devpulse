export interface CoderStats {
  email: string;
  total_seconds: number;
}

export interface CategoryStat {
  name: string;
  userCount: number;
  hours: number;
}

export interface AICoderStat {
  email: string;
  aiTotalSeconds: number;
}

export default function RankingInsights({
  top3,
  bottom3,
  categoryStats,
  aiCoders,
}: {
  top3: CoderStats[];
  bottom3: CoderStats[];
  categoryStats: CategoryStat[];
  aiCoders: AICoderStat[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <p className="text-sm text-gray-400 mb-2">Top Coders</p>
        <div className="space-y-1">
          {top3.map((u, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="truncate">
                #{i + 1} {u.email}
              </span>
              <span className="whitespace-nowrap truncate">
                {Math.floor((u.total_seconds || 0) / 3600)} hrs
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <p className="text-sm text-gray-400 mb-2">Least Coders</p>
        <div className="space-y-1">
          {bottom3.map((u, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="truncate">
                #{i + 1} {u.email}
              </span>
              <span className="whitespace-nowrap truncate">
                {Math.floor((u.total_seconds || 0) / 3600)} hrs
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <p className="text-sm text-gray-400 mb-2">Category Stats</p>

        <div className="space-y-1 text-sm">
          {categoryStats.map((c, i) => (
            <div key={i} className="flex justify-between">
              <span>{c.name}</span>
              <span>
                {c.userCount} users • {c.hours} hrs
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <p className="text-sm text-gray-400 mb-2">Vibe Coders</p>

        <div className="space-y-1 text-sm">
          {aiCoders.map((c, i) => (
            <div key={i} className="flex justify-between">
              <span>{c.email}</span>
              <span>{Math.floor(c.aiTotalSeconds / 3600)} hrs</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
