import { createClient } from "../../../lib/supabase/server";
import LeaderboardTable, {
  NonNullableMember,
} from "../../../components/LeaderboardTable";
import LeaderboardHeader from "@/app/components/leaderboard/Header";
import Footer from "@/app/components/layout/Footer";
import CTA from "@/app/components/layout/CTA";
import { getUserWithProfile } from "@/app/lib/supabase/help/user";

export default async function LeaderboardPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const [{ user }, { slug }, supabase] = await Promise.all([
    getUserWithProfile(),
    props.params,
    createClient(),
  ]);

  const { data: leaderboard } = await supabase
    .from("leaderboards")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!leaderboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] text-white grid-bg">
        <div className="glass-card p-10 text-center">
          <p className="text-gray-400 text-lg">Leaderboard not found</p>
          <p className="text-gray-600 text-sm mt-2">{slug}</p>
        </div>
      </div>
    );
  }

  const { data: members, error } = await supabase
    .from("leaderboard_members_view")
    .select("*")
    .eq("leaderboard_id", leaderboard.id);

  const isOwner = user?.id === leaderboard.owner_id;

  if (error) {
    console.error("Error fetching members:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] text-white grid-bg">
        <div className="glass-card p-10 text-center">
          <p className="text-red-400">Error loading members.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white grid-bg relative">
      <div className="w-full max-w-[1600px] mx-auto p-0 sm:p-6 md:p-10 relative z-10">
        <LeaderboardHeader leaderboard={leaderboard} isOwner={isOwner} />
        <div className="px-4 sm:px-0">
          <LeaderboardTable
            members={members as NonNullableMember[]}
            ownerId={user?.id}
          />
        </div>
      </div>

      {!user && <CTA />}
      <Footer />
    </div>
  );
}
