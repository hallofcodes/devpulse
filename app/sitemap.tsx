import staticSitemap from "./sitemaps/static";
import leaderboardsSitemap from "./sitemaps/leaderboards";
import { MetadataRoute } from "next/types";

export const revalidate = 86400; // 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [staticUrl, leaderboardsUrl] = await Promise.all([
    staticSitemap(),
    leaderboardsSitemap(),
  ]);

  return [...staticUrl, ...leaderboardsUrl];
}
