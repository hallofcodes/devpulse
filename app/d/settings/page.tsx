import { Metadata } from "next/types";
import UserProfile from "@/app/components/dashboard/Settings/Profile";
import ResetPassword from "@/app/components/dashboard/Settings/ResetPassword";
import WakaTimeKey from "@/app/components/dashboard/Settings/WakaTimeKey";
import { getCurrentUser } from "@/app/lib/auth/user";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings - Devpulse",
};

export default async function SettingsPage() {
  const { user } = await getCurrentUser();
  if (!user) return redirect("/login?from=/settings");

  const hasWakaKey = Boolean(user.wakatime_api_key);
  const maskedWakaKey = user.wakatime_api_key
    ? `${user.wakatime_api_key.slice(0, 8)}...${user.wakatime_api_key.slice(-4)}`
    : null;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
        <div className="xl:col-span-2 space-y-4">
          <UserProfile user={user} />
          <WakaTimeKey hasKey={hasWakaKey} maskedKey={maskedWakaKey} />
        </div>

        <div className="xl:col-span-1">
          <ResetPassword email={user.email!} />
        </div>
      </div>
    </div>
  );
}
