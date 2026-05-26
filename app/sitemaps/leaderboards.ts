import type { MetadataRoute } from "next";
import { createPublicClient } from "../lib/supabase/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("leaderboards")
    .select("id, name, slug")
    .order("created_at", { ascending: false });

  if (!data || (data && data.length == 0) || error) return [];

  return data.map((leaderboard) => ({
    url: `https://devpulse.hallofcodes.org/leaderboard/${leaderboard.slug}`,
  }));
}
