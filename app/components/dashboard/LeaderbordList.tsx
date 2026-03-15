import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import BoardList from "../BoardList";

export default async function LeaderboardsList() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: owned } = await supabase
    .from("leaderboards")
    .select("id, name, slug, join_code")
    .eq("owner_id", user.id);

  const { data: joined } = await supabase
    .from("leaderboard_members")
    .select("leaderboards(id, name, slug, join_code)")
    .eq("user_id", user.id)
    .neq("role", "owner");

  const joinedBoards = joined?.map((j: any) => j.leaderboards) || [];

  const ownedCount = owned?.length || 0;
  const joinedCount = joinedBoards.length;

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
          Your Leaderboards
        </h3>
        <span className="text-xs text-gray-600 font-mono">
          {ownedCount + joinedCount} total
        </span>
      </div>

      <div className="space-y-1.5">
        {/* Owned boards */}
        {owned && owned.length > 0 && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-gray-700 font-semibold mt-2 mb-2">
              Owned ({ownedCount})
            </p>
            {owned.map((board) => (
              <BoardList key={board.id} board={board} />
            ))}
          </>
        )}

        {/* Joined boards */}
        {joinedBoards.length > 0 && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-gray-700 font-semibold mt-4 mb-2">
              Joined ({joinedCount})
            </p>
            {joinedBoards.map((board: any) => (
              <BoardList key={board.id} board={board} />
            ))}
          </>
        )}

        {!ownedCount && !joinedCount && (
          <div className="text-center py-10">
            <p className="text-gray-600 text-sm mb-1">No leaderboards yet</p>
            <p className="text-gray-700 text-xs">
              Create or join one to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
