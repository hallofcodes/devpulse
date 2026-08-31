"use client";

import { useSearchParams } from "next/navigation";
import ForgotPasswordForm from "./form/ForgotPasswordForm";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPassword() {
  const searchParams = useSearchParams();

  const redirectParam = searchParams.get("redirect");

  const redirectTo =
    redirectParam &&
    redirectParam.startsWith("/") &&
    !redirectParam.startsWith("//")
      ? redirectParam
      : undefined;

  return (
    <div className="min-h-screen flex relative">
      {/* Left Side - Visual / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 md:p-16 xl:p-24 border-r border-gray-200 bg-slate-800 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-30" />

        <div className="relative z-10">
          <Link
            href="/"
            className="flex items-center gap-3 w-fit hover:opacity-80 transition"
          >
            <Image src="/apple-touch-icon.png" alt="Devpulse Logo" width={40} height={40} />
            <span className="text-2xl font-bold tracking-tight text-white">
              Devpulse
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold mb-5 leading-tight text-white">
            Loss of access? No problem!
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            We got you covered. All you need to do is enter your email address
            and we will send you a password reset link to get you back on track
            with monitoring your coding activity and competing on leaderboards.
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
                <span className="text-blue-600">auth</span>
                <span className="text-gray-700 mx-2">=</span>
                <span className="text-blue-600 mr-2">new</span>
                <span className="text-yellow-400">SupabaseAuth</span>
                <span className="text-gray-700">();</span>
              </div>
              <div className="flex mt-2">
                <span className="text-blue-600">auth</span>
                <span className="text-gray-700">.</span>
                <span className="text-yellow-400">sendPasswordResetEmail</span>
                <span className="text-gray-700">(</span>
                <span className="text-green-600">email</span>
                <span className="text-gray-700">);</span>
              </div>
              <div className="flex mt-3">
                <span className="text-emerald-600/80">
                  {"// Check your inbox. "}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} Devpulse. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 xl:p-20 relative">
        <div className="absolute inset-0 opacity-20 lg:hidden" />

        <div className="w-full max-w-sm relative z-10">
          <Link
            href="/"
            className="lg:hidden flex items-center justify-center gap-3 mb-10"
          >
            <Image src="/apple-touch-icon.png" alt="Devpulse Logo" width={40} height={40} />
            <h2 className="text-3xl font-bold text-gray-900">Devpulse</h2>
          </Link>

          <div className="mb-8 text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Forgot your password?
            </h2>
            <p className="text-gray-500">
              No worries! Just enter your email address and we&apos;ll send you
              an email.
            </p>
          </div>

          <ForgotPasswordForm />

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href={
                redirectTo
                  ? `/login?redirect=${encodeURIComponent(redirectTo)}`
                  : "/login"
              }
              className="text-blue-600 hover:text-blue-600 font-semibold transition-colors underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
