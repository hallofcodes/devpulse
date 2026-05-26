import { Metadata } from "next/types";
import { Suspense } from "react";
import Login from "@/app/components/auth/Login";

export const metadata: Metadata = {
  title: "Login - Devpulse",
  description:
    "Log in to your Devpulse account to monitor your coding activity and compete on leaderboards.",
  keywords: [
    "Devpulse",
    "login",
    "coding activity tracker",
    "developer leaderboards",
    "WakaTime integration",
    "coding stats",
    "programming habits",
    "developer competition",
    "flex your projects",
    "coding streaks",
    "productivity insights",
  ],
  alternates: {
    canonical: "https://devpulse.hallofcodes.org/login",
  },
  openGraph: {
    title: "Login - Devpulse",
    description:
      "Log in to your Devpulse account to monitor your coding activity and compete on leaderboards.",
    url: "https://devpulse.hallofcodes.org/login",
    siteName: "Devpulse",
    images: [
      {
        url: "https://devpulse.hallofcodes.org/images/devpulse.cover.png",
        width: 1200,
        height: 630,
        alt: "Devpulse Cover Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Login - Devpulse",
    description:
      "Log in to your Devpulse account to monitor your coding activity and compete on leaderboards.",
    images: [
      {
        url: "https://devpulse.hallofcodes.org/images/devpulse.cover.png",
        alt: "Devpulse Cover Image",
      },
    ],
  },
};

export default async function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] text-white">
          Loading...
        </div>
      }
    >
      <Login />
    </Suspense>
  );
}
