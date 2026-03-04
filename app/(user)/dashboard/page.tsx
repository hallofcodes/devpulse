import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import DashboardWithKey from "../../components/dashboard/WithKey";
import DashboardWithoutKey from "../../components/dashboard/WithoutKey";
import LeaderboardsList from "@/app/components/dashboard/LeaderbordList";
import Stats from "@/app/components/dashboard/Stats";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("wakatime_api_key, email")
    .eq("id", user.id)
    .single();

  if (!profile?.wakatime_api_key) {
    return <DashboardWithoutKey email={profile?.email || user.email!} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white p-5 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-6xl mx-auto mb-8">
        <DashboardWithKey email={profile?.email || user.email!} />
        <LeaderboardsList />
      </div>

      <div className="max-w-6xl mx-auto flex justify-center">
        <Stats />
      </div>
    </div>
  );
}
