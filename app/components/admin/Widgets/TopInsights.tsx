export default function TopInsights({
  totalUsers,
  totalSeconds,
  totalThreads,
  totalMessages,
}: {
  totalUsers: number;
  totalSeconds: number;
  totalThreads: number;
  totalMessages: number;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass-card p-8">
        <p className="text-sm text-gray-500">Total Users</p>
        <h2 className="text-2xl font-bold">{totalUsers}</h2>
        <p className="text-xs text-gray-500">
          (Average: {Math.floor(totalUsers / 30)} users/day)
        </p>
      </div>

      <div className="glass-card p-8">
        <p className="text-sm text-gray-500">Total Coding Time</p>
        <h2 className="text-2xl font-bold">
          {Math.floor(totalSeconds / 3600)} hrs
        </h2>
        <p className="text-xs text-gray-500">
          (Average: {Math.floor(totalSeconds / totalUsers / 3600)} hrs/user)
        </p>
      </div>

      <div className="glass-card p-8">
        <p className="text-sm text-gray-500">Total Threads</p>
        <h2 className="text-2xl font-bold">{totalThreads}</h2>
        <p className="text-xs text-gray-500">
          (Average: {Math.floor(totalThreads / 30)} threads/day)
        </p>
      </div>

      <div className="glass-card p-8">
        <p className="text-sm text-gray-500">Total Messages</p>
        <h2 className="text-2xl font-bold">{totalMessages}</h2>
        <p className="text-xs text-gray-500">
          (Average: {Math.floor(totalMessages / totalThreads)} msgs/thread)
        </p>
      </div>
    </div>
  );
}
