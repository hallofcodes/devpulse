import { Metadata } from "next/types";
import Signup from "@/app/components/auth/Signup";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign Up - Devpulse",
  description:
    "Create a Devpulse account to monitor your coding activity and compete on leaderboards.",
  alternates: {
    canonical: "https://devpulse.hallofcodes.org/signup",
  },
  openGraph: {
    title: "Sign Up - Devpulse",
    description:
      "Create a Devpulse account to monitor your coding activity and compete on leaderboards.",
    url: "https://devpulse.hallofcodes.org/signup",
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
    title: "Sign Up - Devpulse",
    description:
      "Create a Devpulse account to monitor your coding activity and compete on leaderboards.",
    images: [
      {
        url: "https://devpulse.hallofcodes.org/images/devpulse.cover.png",
        alt: "Devpulse Cover Image",
      },
    ],
  },
};

export default async function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center ">
          Loading...
        </div>
      }
    >
      <Signup />
    </Suspense>
  );
}
