import { redirect } from "next/navigation";
import DashboardWithoutKey from "../components/dashboard/WithoutKey";
import Stats from "@/app/components/dashboard/Stats";
import { Metadata } from "next/types";
import { getCurrentUser } from "@/app/lib/auth/user";

export const metadata: Metadata = {
  title: "Dashboard - Devpulse",
};

export default async function Dashboard() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  if (!user.wakatimeApiKey) {
    return <DashboardWithoutKey email={user.email!} />;
  }
  return <Stats />;
}
