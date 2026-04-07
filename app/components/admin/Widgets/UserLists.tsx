import { Database } from "@/app/supabase-types";

type UserStat = Database["public"]["Views"]["top_user_stats"]["Row"];

export default function UserLists({
  users,
  loading,
}: {
  users: UserStat[];
  loading: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-900 text-gray-400">
          <tr>
            <th className="text-left p-3 whitespace-nowrap">User</th>
            <th className="text-left p-3 whitespace-nowrap">Email</th>
            <th className="text-left p-3 whitespace-nowrap">
              Total Time (hrs)
            </th>
            <th className="text-left p-3 whitespace-nowrap">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr
              key={i}
              className="border-t border-zinc-800 hover:bg-zinc-900/50"
            >
              <td className="p-3">{u.user_id || "N/A"}</td>
              <td className="p-3">{u.email || "N/A"}</td>
              <td className="p-3">
                {Math.floor((u.total_seconds || 0) / 3600)}
              </td>
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
