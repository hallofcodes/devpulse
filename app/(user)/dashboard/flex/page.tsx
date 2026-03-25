import Flex from "@/app/components/Flex";
import { createClient } from "@/app/lib/supabase/server";

export default async function FlexPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return <Flex user={user} />;
}
