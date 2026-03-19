import type { MetadataRoute } from "next";
import staticSitemap from "./sitemaps/static";
import leaderboardsSitemap from "./sitemaps/leaderboards";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [staticUrl, leaderboardsUrl] = await Promise.all([
    staticSitemap(),
    leaderboardsSitemap(),
  ]);

  return [...staticUrl, ...leaderboardsUrl];
}
