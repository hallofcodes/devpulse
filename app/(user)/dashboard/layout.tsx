import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import DashboardLayout from "@/app/components/dashboard/Navbar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4 grid-bg text-white relative">
        <div className="fixed top-0 inset-x-0 h-screen pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[100px] mix-blend-screen" />
        </div>
        <div className="w-full max-w-xl relative z-10">
          {children}
        </div>
      </div>
    );
  }

  const email = profile?.email || user.email!;

  return <DashboardLayout email={email}>{children}</DashboardLayout>;
}
