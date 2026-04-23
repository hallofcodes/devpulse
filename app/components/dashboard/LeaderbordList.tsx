import { createClient } from "../../lib/supabase/server";
import BoardList from "../BoardList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faCrown, faGhost } from "@fortawesome/free-solid-svg-icons";

export interface Leaderboard {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
};

export interface LeaderboardMember {
  leaderboards: Leaderboard | Leaderboard[] | null;
};

export default async function LeaderboardsList() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [ownResult, joinedResult] = await Promise.all([
    supabase
      .from("leaderboards")
      .select("id, name, slug, owner_id")
      .eq("owner_id", user.id),
    supabase
      .from("leaderboard_members")
      .select("leaderboards(id, name, slug, owner_id)")
      .eq("user_id", user.id),
  ]);

  const owned = ownResult.data || [];
  const joined = joinedResult.data || [];

  const joinedBoards =
    joined
      ?.flatMap((j) => {
        if (!j.leaderboards) return [];
        return Array.isArray(j.leaderboards) ? j.leaderboards : [j.leaderboards];
      })
      .filter((board) => board.owner_id !== user.id)
      .filter(
        (board, index, arr) => arr.findIndex((candidate) => candidate.id === board.id) === index
      ) || [];

  const ownedCount = owned?.length || 0;
  const joinedCount = joinedBoards.length;

  return (
    <div
      className="glass-card h-full flex flex-col overflow-hidden relative"
      data-aos="fade-up"
      data-aos-delay="200"
    >
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between p-6 border-b border-white/5 relative z-10">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-gray-200 tracking-tight flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} className="text-indigo-400 w-4 h-4" />
            Your Networks
          </h3>
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
            {ownedCount + joinedCount} Active Sessions
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 pt-4 gap-6 relative z-10 overflow-y-auto">
        {/* Owned boards */}
        {owned && owned.length > 0 && (
          <div className="space-y-3">
             <div className="flex items-center gap-3 mb-2">
               <FontAwesomeIcon icon={faCrown} className="w-3.5 h-3.5 text-yellow-500" />
               <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Administered</p>
               <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
             </div>
            <div className="grid grid-cols-1 gap-3">
              {owned.map((board) => (
                <div key={board.id} className="group relative rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 overflow-hidden shadow-md">
                   <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-yellow-500 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <BoardList user={user} board={board} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Joined boards */}
        {joinedBoards.length > 0 && (
          <div className="space-y-3">
             <div className="flex items-center gap-3 mb-2">
               <FontAwesomeIcon icon={faUsers} className="w-3.5 h-3.5 text-blue-400" />
               <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Joined Networks</p>
               <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
             </div>
            <div className="grid grid-cols-1 gap-3">
              {joinedBoards.map((board) => (
                <div key={board.id} className="group relative rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 overflow-hidden shadow-md">
                   <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <BoardList user={user} board={board} allowLeave />
                </div>
              ))}
            </div>
          </div>
        )}

        {!ownedCount && !joinedCount && (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01] mt-2">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-gray-500 shadow-inner">
               <FontAwesomeIcon icon={faGhost} className="w-5 h-5" />
            </div>
            <p className="text-gray-300 text-[15px] font-bold mb-1.5 tracking-tight">No Active Networks</p>
            <p className="text-gray-500 text-xs max-w-[200px] leading-relaxed">
              Create a new network or join an existing server to start competing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
