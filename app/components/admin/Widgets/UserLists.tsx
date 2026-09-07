export interface UserStat {
  user_id: string;
  name: string;
  email: string;
  role: string;
  email_verified: string;
  wakatime_api_key: string;
  total_seconds: number | null;
  categories: unknown;
}

export default function UserLists({
  users,
  loading,
}: {
  users: UserStat[];
  loading: boolean;
}) {
  return (
    <div className="overflow-x-auto glass-card">
      <table className="min-w-full text-sm">
        <thead className="text-gray-500">
          <tr>
            <th className="text-left p-3 whitespace-nowrap">Name</th>
            <th className="text-left p-3 whitespace-nowrap">Email</th>
            <th className="text-left p-3 whitespace-nowrap">
              Total Time (hrs)
            </th>
            <th className="text-left p-3 whitespace-nowrap">Role</th>
            <th className="text-left p-3 whitespace-nowrap">Verified</th>
            <th className="text-left p-3 whitespace-nowrap">WakaTime</th>
            <th className="text-left p-3 whitespace-nowrap">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i} className="hover:bg-zinc-100">
              <td className="p-3">{u.name || "N/A"}</td>
              <td className="p-3">{u.email || "N/A"}</td>
              <td className="p-3">
                {Math.floor((u.total_seconds || 0) / 3600)}
              </td>
              <td className="p-3 capitalize">{u.role || "N/A"}</td>
              <td className="p-3">{u.email_verified}</td>
              <td className="p-3">{u.wakatime_api_key}</td>
              <td></td>
            </tr>
          ))}

          {!loading && users.length === 0 && (
            <tr>
              <td className="p-4 text-center text-gray-500" colSpan={3}>
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
