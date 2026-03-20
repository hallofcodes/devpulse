import { Metadata } from "next";
import { createClient } from "../../../lib/supabase/server";
import UserProfile from "@/app/components/dashboard/Settings/Profile";
import ResetPassword from "@/app/components/dashboard/Settings/ResetPassword";

export const metadata: Metadata = {
  title: "Settings - DevPulse",
  description:
    "Manage your account settings and including your WakaTime API key.",
};

export default async function LeaderboardsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-600">
          Manage your account settings and including your WakaTime API key.
        </p>
      </div>

      {user && (
        <>
          <UserProfile user={user} />
          <ResetPassword user={user} />
        </>
      )}
    </div>
  );
}
