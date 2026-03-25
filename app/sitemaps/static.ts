import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://devpulse-waka.vercel.app" },
    { url: "https://devpulse-waka.vercel.app/leaderboard" },
    { url: "https://devpulse-waka.vercel.app/flex" },
    { url: "https://devpulse-waka.vercel.app/login" },
    { url: "https://devpulse-waka.vercel.app/signup" },
    { url: "https://devpulse-waka.vercel.app/legal/terms" },
    { url: "https://devpulse-waka.vercel.app/legal/privacy" },
    { url: "https://devpulse-waka.vercel.app/legal/contribution-guidelines" },
  ];
}
