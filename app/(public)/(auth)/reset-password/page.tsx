import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next/types";
import ResetPasswordForm from "@/app/components/auth/form/ResetPasswordForm";
import { Suspense } from "react";

// doesnt need description or keywords since this page is only accessible via a link in the email sent to the user,
// and we dont want it indexed by search engines
export const metadata: Metadata = {
  title: "Reset Password - Devpulse",
  description: "",
  alternates: {
    canonical: "https://devpulse.hallofcodes.org/reset-password",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Reset Password - Devpulse",
    description: "",
    url: "https://devpulse.hallofcodes.org/reset-password",
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
    title: "Reset Password - Devpulse",
    description: "",
    images: [
      {
        url: "https://devpulse.hallofcodes.org/images/devpulse.cover.png",
        alt: "Devpulse Cover Image",
      },
    ],
  },
};

export default async function ResetPassword() {
  return (
    <div className="min-h-screen flex  relative">
      {/* Left Side - Visual / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 md:p-16 xl:p-24 border-r border-gray-200 bg-blue-600 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 grid-bg opacity-30" />

        <div className="relative z-10">
          <Link
            href="/"
            className="flex items-center gap-3 w-fit hover:opacity-80 transition"
          >
            <Image src="/logo.svg" alt="Devpulse Logo" width={40} height={40} />
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              Devpulse
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold mb-5 leading-tight text-gray-900">
            Change your password and get back to tracking your coding activity!
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-8">
            Your Devpulse dashboard is waiting for you. Enter a new password to
            regain access and continue your coding journey.
          </p>

          <div className="glass-card border border-gray-200 rounded-2xl p-5 bg-gray-50 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span className="ml-2 text-xs font-mono text-gray-500">
                setup.ts
              </span>
            </div>
            <div className="space-y-1.5 font-mono text-sm">
              <div className="flex">
                <span className="text-purple-600 mr-2">const</span>
                <span className="text-blue-600">dev</span>
                <span className="text-gray-700 mx-2">=</span>
                <span className="text-indigo-600">getAccount</span>
                <span className="text-gray-700">(</span>
                <span className="text-yellow-700">this</span>
                <span className="text-gray-700">);</span>
              </div>
              <div className="flex mt-2">
                <span className="text-blue-600">dev</span>
                <span className="text-gray-700">.</span>
                <span className="text-yellow-700">setNewPassword</span>
                <span className="text-gray-700">(</span>
                <span className="text-gray-700">
                  &quot;your-new-password&quot;
                </span>
                <span className="text-gray-700">);</span>
              </div>
              <div className="flex mt-3">
                <span className="text-emerald-600/80">
                  {"// And just like that, you&apos;re back in the game. 🎉"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-500 font-medium">
          &copy; {new Date().getFullYear()} Devpulse. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 xl:p-20 relative">
        <div className="absolute inset-0 grid-bg opacity-20 lg:hidden" />

        <div className="w-full max-w-sm relative z-10">
          <Link
            href="/"
            className="lg:hidden flex items-center justify-center gap-3 mb-10"
          >
            <Image src="/logo.svg" alt="Devpulse Logo" width={40} height={40} />
            <h2 className="text-3xl font-bold text-gray-900">Devpulse</h2>
          </Link>

          <div className="mb-8 text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Reset your password
            </h2>
            <p className="text-gray-500">
              New password, who dis? Enter a new password to regain access to
              your account and get back to tracking your coding stats!
            </p>
          </div>

          <Suspense
            fallback={
              <div className="text-center text-gray-500">Loading...</div>
            }
          >
            <ResetPasswordForm />
          </Suspense>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-500 hover:underline transition"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
