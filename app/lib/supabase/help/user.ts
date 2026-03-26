import { cache } from "react";
import { createClient } from "../server";

export const getUserWithProfile = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("wakatime_api_key, email, role")
    .eq("id", user.id)
    .single();

  return { user, profile };
});
