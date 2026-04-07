import { Metadata } from "next";
import UserProfile from "@/app/components/dashboard/Settings/Profile";
import ResetPassword from "@/app/components/dashboard/Settings/ResetPassword";
import WakaTimeKey from "@/app/components/dashboard/Settings/WakaTimeKey";
import { getUserWithProfile } from "@/app/lib/supabase/help/user";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings - DevPulse",
};

export default async function SettingsPage() {
  const { user, profile } = await getUserWithProfile();
  if (!user) return redirect("/login?from=/dashboard/settings");

  const hasWakaKey = Boolean(profile?.wakatime_api_key);
  const maskedWakaKey = profile?.wakatime_api_key
    ? `${profile.wakatime_api_key.slice(0, 8)}...${profile.wakatime_api_key.slice(-4)}`
    : null;

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      <div className="glass-card p-4 md:p-5 border-t-4 border-indigo-500/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Account Settings
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              Manage profile details, WakaTime connection, and account security.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider">
            <span
              className={`px-2 py-1 rounded-full border font-semibold ${
                hasWakaKey
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
              }`}
            >
              {hasWakaKey ? "WakaTime Connected" : "WakaTime Not Connected"}
            </span>
          </div>
        </div>
      </div>

      {user && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
          <div className="xl:col-span-2 space-y-4">
            <UserProfile user={user} />
            <WakaTimeKey hasKey={hasWakaKey} maskedKey={maskedWakaKey} />
          </div>

          <div className="xl:col-span-1">
            <ResetPassword user={user} />
          </div>
        </div>
      )}
    </div>
  );
}
