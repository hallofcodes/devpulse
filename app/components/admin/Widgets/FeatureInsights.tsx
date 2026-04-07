export default function FeatureInsights({
  totalLeaderboards,
  totalUsers,
  totalFlexes,
}: {
  totalLeaderboards: number;
  totalUsers: number;
  totalFlexes: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <p className="text-sm text-gray-400 mb-2">Leaderboard Stats</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Total</span>
            <span>{totalLeaderboards}</span>
          </div>
          <div className="flex justify-between">
            <span className="truncate">Avg Users/Leaderboard</span>
            <span className="truncate">
              {totalLeaderboards > 0
                ? Math.floor(totalUsers / totalLeaderboards)
                : 0}{" "}
              users
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <p className="text-sm text-gray-400 mb-2">Flex Stats</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Total</span>
            <span>{totalFlexes}</span>
          </div>
          <div className="flex justify-between">
            <span className="truncate">Avg Users/Flex</span>
            <span className="truncate">
              {totalFlexes > 0 ? Math.floor(totalUsers / totalFlexes) : 0} users
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
