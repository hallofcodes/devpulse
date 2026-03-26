import { Metadata } from "next";
import UserProfile from "@/app/components/dashboard/Settings/Profile";
import ResetPassword from "@/app/components/dashboard/Settings/ResetPassword";
import { getUserWithProfile } from "@/app/lib/supabase/help/user";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings - DevPulse",
};

export default async function LeaderboardsPage() {
  const { user } = await getUserWithProfile();
  if (!user) return redirect("/login?from=/dashboard/settings");

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
