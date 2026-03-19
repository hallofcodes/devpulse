import { createClient } from "../lib/supabase/server";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leaderboards")
    .select("id, name, slug")
    .order("created_at", { ascending: false });

  if (error) return [];

  return data.map((leaderboard) => ({
    url: `https://devpulse-waka.vercel.app/leaderboard/${leaderboard.slug}`,
  }));
}
