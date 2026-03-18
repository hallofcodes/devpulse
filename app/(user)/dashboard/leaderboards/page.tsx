import DashboardWithKey from "../../../components/dashboard/WithKey";
import LeaderboardsList from "@/app/components/dashboard/LeaderbordList";       
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboards - DevPulse",
  description: "Create, join, and manage your coding leaderboards.",
};

export default function LeaderboardsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
