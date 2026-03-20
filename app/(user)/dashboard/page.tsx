import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import DashboardWithoutKey from "../../components/dashboard/WithoutKey";
import Stats from "@/app/components/dashboard/Stats";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - DevPulse",
  description: "Monitor your coding activity and manage your leaderboards.",
};

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("wakatime_api_key, email")
    .eq("id", user.id)
    .single();

  if (!profile?.wakatime_api_key) {
    return <DashboardWithoutKey email={profile?.email || user.email!} />;
  }

  const email = profile?.email || user.email!;
  const name = user?.user_metadata?.name || email.split("@")[0];

  return <Stats name={name} email={email} />;
}
