import BoardList from "../BoardList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faCrown, faGhost } from "@fortawesome/free-solid-svg-icons";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth/user";

export interface Leaderboard {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
}

export default async function LeaderboardsList() {
  const { user } = await getCurrentUser();
  if (!user) return null;

  const [owned, memberships] = await Promise.all([
    prisma.leaderboard.findMany({
      where: { owner_id: user.id },
      select: { id: true, name: true, slug: true, owner_id: true },
    }),
    prisma.leaderboardMember.findMany({
      where: { user_id: user.id, role: "member" },
      include: {
        leaderboard: {
          select: { id: true, name: true, slug: true, owner_id: true },
        },
      },
    }),
  ]);

  const joinedBoards = memberships.map((m) => m.leaderboard);

  const allBoards = [
    ...owned.map((board) => ({ board, isOwner: true })),
    ...joinedBoards.map((board) => ({ board, isOwner: false })),
  ];

  const userForBoard = { id: user.id, email: user.email ?? "" };

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {allBoards.length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allBoards.map(({ board, isOwner }) => (
              <div key={board.id} className="glass-card">
                {isOwner && (
                  <FontAwesomeIcon
                    icon={faCrown}
                    className="absolute top-2 right-2 w-3 h-3 text-amber-500 z-10"
                  />
                )}
                <BoardList
                  user={userForBoard}
                  board={{ ...board, owner_id: board.owner_id }}
                  allowLeave={!isOwner}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 rounded-xl bg-white/[0.01] mt-2">
          <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mb-4 text-gray-500 shadow-inner">
            <FontAwesomeIcon icon={faGhost} className="w-5 h-5" />
          </div>
          <p className="text-gray-600 text-[15px] font-bold mb-1.5 tracking-tight">
            You haven&apos;t joined any boards yet.
          </p>
          <p className="text-gray-500 text-xs max-w-[200px] leading-relaxed">
            Create a new network or join an existing server to start competing.
          </p>
        </div>
      )}
    </div>
  );
}
