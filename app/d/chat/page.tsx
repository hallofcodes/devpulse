import Chat from "@/app/components/Chat";
import { getUserWithProfile } from "@/app/lib/supabase/help/user";
import { Metadata } from "next/types";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Chat - Devpulse",
};

export default async function ChatPage() {
  const { user } = await getUserWithProfile();

  if (!user) return redirect("/login?from=/chat");

  return <Chat user={user} />;
}
