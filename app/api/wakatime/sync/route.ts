import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get profile with API key
  const { data: profile } = await supabase
    .from("profiles")
    .select("wakatime_api_key")
    .eq("id", user.id)
    .single();

  if (!profile?.wakatime_api_key) {
    return NextResponse.json({ error: "No API key found" }, { status: 400 });
  }

  // Check last fetch
  const { data: existing } = await supabase
    .from("user_stats")
    .select("last_fetched_at")
    .eq("user_id", user.id)
    .single();

  const now = new Date();
  const sixHours = 6 * 60 * 60 * 1000;

  if (existing?.last_fetched_at) {
    const lastFetch = new Date(existing.last_fetched_at).getTime();
    if (now.getTime() - lastFetch < sixHours) {
      return NextResponse.json({ message: "Using cached stats" });
    }
  }

  // Fetch from WakaTime
  const response = await fetch(
    "https://wakatime.com/api/v1/users/current/stats/last_7_days",
    {
      headers: {
        Authorization: `Basic ${Buffer.from(profile.wakatime_api_key).toString(
          "base64",
        )}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch WakaTime" },
      { status: 500 },
    );
  }

  const { data: result, error } = await supabase.from("user_stats").upsert({
    user_id: user.id,
    total_seconds:  Math.floor(data.data.total_seconds),
    languages: data.data.languages,
    operating_systems: data.data.operating_systems,
    editors: data.data.editors,
    last_fetched_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: !!result, error });
}
