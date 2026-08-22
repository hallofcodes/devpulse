import BoardList from "../BoardList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faCrown, faGhost } from "@fortawesome/free-solid-svg-icons";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth/user";

export interface Leaderboard {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
}

export default async function LeaderboardsList() {
  const { user } = await getCurrentUser();
  if (!user) return null;

  const [owned, memberships] = await Promise.all([
    prisma.leaderboard.findMany({
      where: { ownerId: user.id },
      select: { id: true, name: true, slug: true, ownerId: true },
    }),
    prisma.leaderboardMember.findMany({
      where: { user_id: user.id, role: "member" },
      include: {
        leaderboard: {
          select: { id: true, name: true, slug: true, ownerId: true },
        },
      },
    }),
  ]);

  const joinedBoards = memberships.map((m) => m.leaderboard);
  const ownedCount = owned.length;
  const joinedCount = joinedBoards.length;

  const userForBoard = { id: user.id, email: user.email ?? "" };

  return (
    <div
      className="glass-card h-full flex flex-col overflow-hidden relative"
     
      data-aos-delay="200"
    >
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between p-6 border-b border-gray-200 relative z-10">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-gray-700 tracking-tight flex items-center gap-2">
            <FontAwesomeIcon
              icon={faUsers}
              className="text-blue-600 w-4 h-4"
            />
            Your Networks
          </h3>
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
            {ownedCount + joinedCount} Active Sessions
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 pt-4 gap-6 relative z-10 overflow-y-auto">
        {owned.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <FontAwesomeIcon
                icon={faCrown}
                className="w-3.5 h-3.5 text-yellow-500"
              />
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                Administered
              </p>
              <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {owned.map((board) => (
                <div
                  key={board.id}
                  className="group relative rounded-xl border border-gray-200 bg-white/[0.01] hover:bg-gray-100 transition-all duration-300 overflow-hidden shadow-md"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-yellow-500 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <BoardList
                    user={userForBoard}
                    board={{ ...board, owner_id: board.ownerId }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {joinedBoards.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <FontAwesomeIcon
                icon={faUsers}
                className="w-3.5 h-3.5 text-blue-600"
              />
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                Joined Networks
              </p>
              <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {joinedBoards.map((board) => (
                <div
                  key={board.id}
                  className="group relative rounded-xl border border-gray-200 bg-white/[0.01] hover:bg-gray-100 transition-all duration-300 overflow-hidden shadow-md"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <BoardList
                    user={userForBoard}
                    board={{ ...board, owner_id: board.ownerId }}
                    allowLeave
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {!ownedCount && !joinedCount && (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 rounded-xl bg-white/[0.01] mt-2">
            <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mb-4 text-gray-500 shadow-inner">
              <FontAwesomeIcon icon={faGhost} className="w-5 h-5" />
            </div>
            <p className="text-gray-600 text-[15px] font-bold mb-1.5 tracking-tight">
              No Active Networks
            </p>
            <p className="text-gray-500 text-xs max-w-[200px] leading-relaxed">
              Create a new network or join an existing server to start
              competing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
