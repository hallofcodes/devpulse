import Flex from "@/app/components/Flex";
import { getCurrentUser } from "@/app/lib/auth/user";
import { Metadata } from "next/types";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Flex - Devpulse",
};

export default async function FlexPage() {
  const { user } = await getCurrentUser();

  if (!user) return redirect("/login?from=/flex");

  return <Flex />;
}
