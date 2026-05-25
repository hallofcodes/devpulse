import type { MetadataRoute } from "next/types";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://devpulse.hallofcodes.org" },
    { url: "https://devpulse.hallofcodes.org/leaderboard" },
    { url: "https://devpulse.hallofcodes.org/flex" },
    { url: "https://devpulse.hallofcodes.org/login" },
    { url: "https://devpulse.hallofcodes.org/signup" },
    { url: "https://devpulse.hallofcodes.org/legal/terms" },
    { url: "https://devpulse.hallofcodes.org/legal/privacy" },
    { url: "https://devpulse.hallofcodes.org/legal/contribution-guidelines" },
  ];
}
