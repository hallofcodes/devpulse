import DashboardWithKey from "../../../components/dashboard/WithKey";
import LeaderboardsList from "@/app/components/dashboard/LeaderbordList";
import { getUserWithProfile } from "@/app/lib/supabase/help/user";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Leaderboards - DevPulse",
};

export default async function LeaderboardsPage() {
  const { user } = await getUserWithProfile();
  if (!user) return redirect("/login?from=/dashboard/settings");

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-white/5 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leaderboards</h1>
          <p className="text-sm text-gray-500 font-medium tracking-wide mt-1">
            Create, join, and manage your coding servers
          </p>
        </div>
        <DashboardWithKey />
      </div>

      <div className="w-full">
        <LeaderboardsList />
      </div>
    </div>
  );
}
