import Image from "next/image";
import Banner from "./Banner";
import BackButton from "./BackButton";
import InviteFriendsButton from "./InviteFriendsButton";

interface LeaderboardRow {
  id: string;
  name: string;
  description?: string | null;
  join_code?: string | null;
}

export default function LeaderboardHeader({
  leaderboard,
}: {
  leaderboard: LeaderboardRow;
}) {
  return (
    <>
      <div className="group relative mb-20 sm:mb-24">
        {/* Using a temporary placeholder banner image */}
        <Banner
          name={leaderboard.name}
          imageUrl="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
        />

        {/* Top actions overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-20 pointer-events-none">
          <div className="pointer-events-auto">
            <BackButton />
          </div>
        </div>

        <div className="absolute left-6 right-4 sm:left-8 sm:right-8 -bottom-14 sm:-bottom-16 flex items-end justify-between gap-3 sm:gap-6 z-10">
          <div className="flex items-end gap-3 sm:gap-6 flex-1 min-w-0">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white p-1.5 sm:p-2 shadow-2xl shrink-0">
              <div className="w-full h-full rounded-xl bg-[#121226] border border-gray-200 flex items-center justify-center overflow-hidden relative">
                <Image
                  src="/apple-touch-icon.png"
                  alt="Devpulse Logo"
                  width={40}
                  height={40}
                  className="object-contain opacity-80 sm:w-[50px] sm:h-[50px]"
                />
              </div>
            </div>

            <div className="mb-2 sm:mb-3 max-w-[calc(100%-120px)] sm:max-w-xl">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3 truncate">
                {leaderboard.name}
              </h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base font-medium truncate sm:whitespace-normal leading-relaxed">
                {leaderboard.description && leaderboard.description?.length > 0
                  ? leaderboard.description
                  : `Join ${leaderboard.name} to track your coding metrics, compete with fellow developers, and showcase your engineering skills.`}
              </p>
            </div>
          </div>

          <div className="mb-2 sm:mb-3 shrink-0 scale-90 sm:scale-95 origin-bottom-right">
            <InviteFriendsButton
              joinCode={leaderboard?.join_code || undefined}
              leaderboardName={leaderboard.name}
            />
          </div>
        </div>
      </div>
    </>
  );
}
