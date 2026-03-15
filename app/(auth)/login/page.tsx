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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] text-white px-4 grid-bg relative">
      <div className="glow-orb w-[400px] h-[400px] bg-indigo-600/10 top-1/4 left-1/2 -translate-x-1/2" />

      <div className="w-full max-w-lg glass-card p-10 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <Image src="/logo.svg" alt="DevPulse Logo" width={36} height={36} />
          <h2 className="text-2xl font-bold gradient-text">DevPulse</h2>
        </div>
        <p className="mb-8 text-gray-400 text-sm">
          Welcome back! Please enter your credentials to log in.
        </p>

        <LoginForm />

        <Link
          href="/signup"
          className="block mt-6 text-center text-sm text-gray-500 hover:text-gray-300 transition"
        >
          Don&apos;t have an account? <span className="text-indigo-400">Sign Up</span>
        </Link>
      </div>
    </div>
  );
}
