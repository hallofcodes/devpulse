import type { MetadataRoute } from "next";
import { prisma } from "../lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const leaderboards = await prisma.leaderboard.findMany({
    select: { slug: true },
    orderBy: { createdAt: "desc" },
  });

  return leaderboards.map((lb) => ({
    url: `https://devpulse.hallofcodes.org/leaderboard/${lb.slug}`,
  }));
}
