import { redirect } from "next/navigation";
import Stats from "@/app/components/dashboard/Stats";
import { Metadata } from "next/types";
import { getCurrentUser } from "@/app/lib/auth/user";

export const metadata: Metadata = {
  title: "Dashboard - Devpulse",
};

export default async function Dashboard() {
  const { user } = await getCurrentUser();
  if (!user) redirect("/login");

  return <Stats />;
}
