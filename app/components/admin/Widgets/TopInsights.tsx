// tried my best to make changes to the exsisting code but then decided to re-write it completly 

"use client";

export default function TopInsights({
  totalUsers,
  totalSeconds,
}: {
  totalUsers: number;
  totalSeconds: number;
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
          (Average:{" "}
          {totalUsers > 0
            ? Math.floor(totalSeconds / totalUsers / 3600)
            : 0}{" "}
          hrs/user)
        </p>
      </div>
    </div>
  );
}
