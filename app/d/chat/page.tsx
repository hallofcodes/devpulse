import Chat from "@/app/components/Chat";
import { getCurrentUser } from "@/app/lib/auth/user";
import { Metadata } from "next/types";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Chat - Devpulse",
};

export default async function ChatPage() {
  const { user } = await getCurrentUser();

  if (!user) return redirect("/login?from=/chat");

  return <Chat user={user} />;
}
