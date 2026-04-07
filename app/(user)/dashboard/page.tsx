import { redirect } from "next/navigation";
import DashboardWithoutKey from "../../components/dashboard/WithoutKey";
import Stats from "@/app/components/dashboard/Stats";
import { Metadata } from "next";
import { getUserWithProfile } from "@/app/lib/supabase/help/user";

export const metadata: Metadata = {
  title: "Dashboard - DevPulse",
};

export default async function Dashboard() {
  const { user, profile } = await getUserWithProfile();
  if (!user) redirect("/login");

  if (!profile?.wakatime_api_key) {
    return <DashboardWithoutKey email={profile?.email || user.email!} />;
  }

  const email = profile?.email || user.email!;
  const name = user?.user_metadata?.name || email.split("@")[0];
  const prefferedAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.avatar ||
    null;

  return <Stats name={name} email={email} avatar={prefferedAvatar} />;
}
