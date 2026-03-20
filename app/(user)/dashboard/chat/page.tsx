import Chat from "@/app/components/Chat";
import { createClient } from "@/app/lib/supabase/server";

export default async function ChatPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return <Chat user={user} />;
}
