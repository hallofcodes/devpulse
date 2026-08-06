import ForgotPassword from "@/app/components/auth/ForgotPassword";
import { Metadata } from "next/types";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Forgot Password - Devpulse",
  description:
    "Lost access to your Devpulse account? Enter your email address to receive a password reset link and get back to tracking your coding activity and competing on leaderboards.",
  alternates: {
    canonical: "https://devpulse.hallofcodes.org/forgot-password",
  },
  openGraph: {
    title: "Forgot Password - Devpulse",
    description:
      "Lost access to your Devpulse account? Enter your email address to receive a password reset link and get back to tracking your coding activity and competing on leaderboards.",
    url: "https://devpulse.hallofcodes.org/forgot-password",
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
    title: "Forgot Password - Devpulse",
    description:
      "Lost access to your Devpulse account? Enter your email address to receive a password reset link and get back to tracking your coding activity and competing on leaderboards.",
    images: [
      {
        url: "https://devpulse.hallofcodes.org/images/devpulse.cover.png",
        alt: "Devpulse Cover Image",
      },
    ],
  },
};

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center ">
          Loading...
        </div>
      }
    >
      <ForgotPassword />
    </Suspense>
  );
}
