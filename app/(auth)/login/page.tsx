import Link from "next/link";
import Image from "next/image";
import LoginForm from "@/app/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - DevPulse",
  description:
    "Log in to your DevPulse account to monitor your coding activity and compete on leaderboards.",
};

export default async function Login() {
  return (
    <div className="min-h-screen flex bg-[#0a0a1a] text-[#e2e8f0] selection:bg-indigo-500/30">
      {/* Left Side Branding */}
      <div className="hidden md:flex flex-col justify-between w-5/12 lg:w-1/2 p-12 lg:p-20 relative overflow-hidden grid-bg border-r border-white/5">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] mix-blend-screen pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <Link href="/" className="inline-block hover:scale-105 transition-transform mb-12 cursor-pointer">
              <div className="flex items-center gap-3">
                <Image src="/logo.svg" alt="DevPulse Logo" width={40} height={40} />
                <span className="text-xl font-bold gradient-text">DevPulse</span>
              </div>
            </Link>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight max-w-lg">
              Welcome back to your dashboard.
            </h2>
            <p className="text-gray-400 text-base leading-relaxed max-w-md">
              Log in to continue tracking your coding activity, analyzing your programming habits, and competing on leaderboards.
            </p>
          </div>
          
          <div className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} DevPulse. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-[#0a0a1a] sm:bg-[#0c0c24] relative">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Login</h2>
            <p className="text-gray-400 text-sm">Enter your credentials to access your account.</p>
          </div>

          <div className="relative z-10">
            <LoginForm />
          </div>

          <div className="mt-12 flex flex-col items-center sm:items-start text-sm text-gray-500">
            <div>
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
