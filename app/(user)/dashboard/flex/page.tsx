import Flex from "@/app/components/Flex";
import { getUserWithProfile } from "@/app/lib/supabase/help/user";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Flexes - DevPulse",
};

export default async function FlexPage() {
  const { user } = await getUserWithProfile();

  if (!user) return redirect("/login?from=/dashboard/flex");

  return <Flex user={user} />;
}
