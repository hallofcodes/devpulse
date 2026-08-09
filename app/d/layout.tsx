import { redirect } from "next/navigation";
import DashboardLayout from "@/app/components/dashboard/Navbar";
import { getCurrentUser } from "@/app/lib/auth/user";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  const email = user.email ?? "";
  const name = user.name || (email ? email.split("@")[0] : "User");

  return (
    <DashboardLayout
      email={email}
      name={name}
      avatar={user.image || null}
      role={user.role || "user"}
    >
      {children}
    </DashboardLayout>
  );
}
