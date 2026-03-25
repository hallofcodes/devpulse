import Link from "next/link";
import Image from "next/image";
import SignupForm from "@/app/components/auth/SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - DevPulse",
  description:
    "Create a DevPulse account to monitor your coding activity and compete on leaderboards.",
  openGraph: {
    title: "Sign Up - DevPulse",
    description:
      "Create a DevPulse account to monitor your coding activity and compete on leaderboards.",
    url: "https://devpulse-waka.vercel.app/signup",
    siteName: "DevPulse",
    images: [
      {
        url: "https://devpulse-waka.vercel.app/images/devpulse.cover.png",
        width: 1200,
        height: 630,
        alt: "DevPulse Cover Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up - DevPulse",
    description:
      "Create a DevPulse account to monitor your coding activity and compete on leaderboards.",
    images: [
      {
        url: "https://devpulse-waka.vercel.app/images/devpulse.cover.png",
        alt: "DevPulse Cover Image",
      },
    ],
  },
};

export default async function Signup(props: {
  searchParams?: Promise<{ redirect?: string }>;
}) {
  const redirectParam = (await props.searchParams)?.redirect;
  const redirectTo =
    redirectParam &&
    redirectParam.startsWith("/") &&
    !redirectParam.startsWith("//")
      ? redirectParam
      : undefined;

  return (
    <div className="min-h-screen flex bg-[#0a0a1a] text-white">
      {/* Left Side - Visual / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 md:p-16 xl:p-24 border-r border-white/5 bg-gradient-to-br from-[#0a0a1a] to-[#0a0a1a] overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 grid-bg opacity-30" />

        <div className="relative z-10">
          <Link
            href="/"
            className="flex items-center gap-3 w-fit hover:opacity-80 transition"
          >
            <Image src="/logo.svg" alt="DevPulse Logo" width={40} height={40} />
            <span className="text-2xl font-bold tracking-tight text-white">
              DevPulse
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold mb-5 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Start measuring your coding pulse.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Join thousands of developers tracking their progress, competing on
            leaderboards, and leveling up their skills.
          </p>

          <div className="glass-card border border-white/5 rounded-2xl p-5 bg-white/5 backdrop-blur-md shadow-2xl">
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
                <span className="text-purple-400 mr-2">const</span>
                <span className="text-blue-400">dev</span>
                <span className="text-gray-200 mx-2">=</span>
                <span className="text-indigo-400 mr-2">new</span>
                <span className="text-yellow-200">Developer</span>
                <span className="text-gray-200">();</span>
              </div>
              <div className="flex mt-2">
                <span className="text-blue-400">dev</span>
                <span className="text-gray-200">.</span>
                <span className="text-yellow-200">connect</span>
                <span className="text-gray-200">(</span>
                <span className="text-green-400">&apos;wakatime&apos;</span>
                <span className="text-gray-200">);</span>
              </div>
              <div className="flex mt-3">
                <span className="text-emerald-400/80">
                  {"// Your journey begins here. 🚀"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-500 font-medium">
          &copy; {new Date().getFullYear()} DevPulse. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 xl:p-20 relative">
        <div className="absolute inset-0 grid-bg opacity-20 lg:hidden" />

        <div className="w-full max-w-sm relative z-10">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <Image src="/logo.svg" alt="DevPulse Logo" width={40} height={40} />
            <h2 className="text-3xl font-bold text-white">DevPulse</h2>
          </div>

          <div className="mb-8 text-left">
            <h2 className="text-3xl font-bold text-white mb-2">
              Create an account
            </h2>
            <p className="text-gray-400">
              Start tracking your coding stats today.
            </p>
          </div>

          <SignupForm />

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href={
                redirectTo
                  ? `/login?redirect=${encodeURIComponent(redirectTo)}`
                  : "/login"
              }
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
