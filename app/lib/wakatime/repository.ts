import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/supabase-types";

type AppSupabaseClient = SupabaseClient<Database>;

export async function getExistingUserStats(
  supabase: AppSupabaseClient,
  userId: string,
) {
  return supabase
    .from("user_stats")
    .select(
      `
        *,
        projects:user_projects (
          projects
        )
      `,
    )
    .eq("user_id", userId)
    .single();
}

export async function updateProfileWakatimeApiKey(
  supabase: AppSupabaseClient,
  userId: string,
  apiKey: string,
) {
  return supabase.from("profiles").update({ wakatime_api_key: apiKey }).eq("id", userId);
}

export async function upsertUserStats(
  supabase: AppSupabaseClient,
  payload: Database["public"]["Tables"]["user_stats"]["Insert"],
) {
  return supabase.from("user_stats").upsert(payload).select().single();
}

export async function upsertUserProjects(
  supabase: AppSupabaseClient,
  payload: Database["public"]["Tables"]["user_projects"]["Insert"],
) {
  return supabase.from("user_projects").upsert(payload).select().single();
}

export async function upsertUserDashboardSnapshot(
  supabase: AppSupabaseClient,
  payload: Database["public"]["Tables"]["user_dashboard_snapshots"]["Insert"],
) {
  return supabase
    .from("user_dashboard_snapshots")
    .upsert(payload, { onConflict: "user_id,snapshot_date" });
}