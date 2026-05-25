import { redirect } from "next/navigation";
import DashboardWithoutKey from "../components/dashboard/WithoutKey";
import Stats from "@/app/components/dashboard/Stats";
import { Metadata } from "next/types";
import { getUserWithProfile } from "@/app/lib/supabase/help/user";

export const metadata: Metadata = {
  title: "Dashboard - Devpulse",
};

export default async function Dashboard() {
  const { user, profile } = await getUserWithProfile();
  if (!user) redirect("/login");

  if (!profile?.wakatime_api_key) {
    return <DashboardWithoutKey email={profile?.email || user.email!} />;
  }
  return <Stats />;
}
