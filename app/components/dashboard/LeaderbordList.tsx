import { createClient } from "../../lib/supabase/server";

export default async function LeaderboardsList() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: owned } = await supabase
    .from("leaderboards")
    .select("id, name, join_code")
    .eq("owner_id", user.id);

  const { data: joined } = await supabase
    .from("leaderboard_members")
    .select("leaderboards(id, name)")
    .eq("user_id", user.id);

  const joinedBoards = joined?.map((j: any) => j.leaderboards) || [];

  return (
    <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/10">
      <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
        Your Leaderboards
      </h3>

      <div className="space-y-4">
        {owned?.map((board) => (
          <div
            key={board.id}
            className="p-4 rounded-xl bg-black/40 border border-gray-700"
          >
            <p className="font-semibold">{board.name}</p>
            <p className="text-sm text-green-400">Owner</p>
            <p className="text-sm text-gray-400">Join Code: {board.join_code}</p>
          </div>
        ))}

        {joinedBoards.map((board: any) => (
          <div
            key={board.id}
            className="p-4 rounded-xl bg-black/40 border border-gray-700"
          >
            <p className="font-semibold">{board.name}</p>
            <p className="text-sm text-gray-400">Member</p>
          </div>
        ))}

        {!owned?.length && !joinedBoards.length && (
          <p className="text-gray-500 text-sm">
            You haven&apos;t joined or created any leaderboards yet.
          </p>
        )}
      </div>
    </div>
  );
}
