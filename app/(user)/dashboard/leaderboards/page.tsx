import DashboardWithKey from "../../../components/dashboard/WithKey";
import LeaderboardsList from "@/app/components/dashboard/LeaderbordList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboards - DevPulse",
  description: "Create, join, and manage your coding leaderboards.",
};

export default function LeaderboardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Leaderboards</h1>
        <p className="text-sm text-gray-600">
          Create, join, and manage your coding leaderboards
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2">
          <DashboardWithKey />
        </div>
        <div className="xl:col-span-3">
          <LeaderboardsList />
        </div>
      </div>
    </div>
  );
}
