import { redirect } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/Navbar";
import { getUserWithProfile } from "@/app/lib/supabase/help/user";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getUserWithProfile();
  if (!user) redirect("/login");

  const email = profile?.email || user.email!;
  const name = user?.user_metadata?.name || email.split("@")[0];
  const prefferedAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.avatar ||
    null;

  return (
    <DashboardLayout
      email={email}
      name={name}
      avatar={prefferedAvatar}
      role={profile?.role || "user"}
    >
      {children}
    </DashboardLayout>
  );
}
