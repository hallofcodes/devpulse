import Leaderboards from "@/app/components/dashboard/Leaderboards";
import LeaderboardsList from "@/app/components/dashboard/LeaderbordList";
import { getCurrentUser } from "@/app/lib/auth/user";
import { Metadata } from "next/types";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Leaderboards - Devpulse",
};

export default async function LeaderboardsPage() {
  const { user } = await getCurrentUser();
  if (!user) return redirect("/login?from=/leaderboards");

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Leaderboards
          </h1>
          <p className="text-sm text-gray-500 font-medium tracking-wide mt-1">
            Create, join, and manage your coding servers
          </p>
        </div>
        <Leaderboards />
      </div>

      <LeaderboardsList />
    </div>
  );
}
