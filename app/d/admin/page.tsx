import Dashboard from "@/app/components/admin/Dashbord";
import { getUserWithProfile } from "@/app/lib/supabase/help/user";
import { Metadata } from "next/types";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Panel - Devpulse",
};

export default async function AdminPage() {
  const { user, profile } = await getUserWithProfile();

  if (!user) {
    redirect("/login?from=/dashboard/admin");
  }

  if (!profile || profile.role !== "admin") {
    redirect("/dashbord");
  }

  return <Dashboard user={user} />;
}
