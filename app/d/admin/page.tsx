import Dashboard from "@/app/components/admin/Dashbord";
import { getCurrentUser } from "@/app/lib/auth/user";
import { Metadata } from "next/types";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Panel - Devpulse",
};

export default async function AdminPage() {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect("/login?from=/admin");
  }

  if (user.role !== "admin") {
    redirect("/d");
  }

  return <Dashboard />;
}
