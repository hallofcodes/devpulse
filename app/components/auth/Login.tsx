"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LoginForm from "./form/LoginForm";

export default function Login() {
  const searchParams = useSearchParams();

  const redirectParam = searchParams.get("redirect");

  const redirectTo =
    redirectParam &&
    redirectParam.startsWith("/") &&
    !redirectParam.startsWith("//")
      ? redirectParam
      : undefined;

  return (
    <div className="min-h-screen flex  relative">
      {/* Left Side - Visual / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 md:p-16 xl:p-24 border-r border-gray-200 bg-slate-800 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 grid-bg opacity-30" />

        <div className="relative z-10">
          <Link
            href="/"
            className="flex items-center gap-3 w-fit hover:opacity-80 transition"
          >
            <Image src="/logo.svg" alt="Devpulse Logo" width={40} height={40} />
            <span className="text-2xl font-bold tracking-tight text-white">
              Devpulse
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold mb-5 leading-tight text-white">
            Welcome back to your dashboard.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            Access your personalized coding metrics, compare your stats, and
            keep your productivity streak alive.
          </p>

          <div className="glass-card border border-gray-200 rounded-2xl p-5 bg-gray-50 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <span className="ml-2 text-xs font-mono text-gray-500">
                devpulse-auth.ts
              </span>
            </div>
            <div className="space-y-1.5 font-mono text-sm">
              <div className="flex">
                <span className="text-indigo-600 mr-2">import</span>
                <span className="text-gray-700">{"{ Metrics }"}</span>
                <span className="text-indigo-600 mx-2">from</span>
                <span className="text-green-600">
                  &apos;@devpulse/core&apos;
                </span>
                <span className="text-gray-500">;</span>
              </div>
              <div className="flex mt-2">
                <span className="text-purple-600 mr-2">await</span>
                <span className="text-blue-600">Metrics</span>
                <span className="text-gray-700">.</span>
                <span className="text-yellow-700">syncToday</span>
                <span className="text-gray-700">();</span>
              </div>
              <div className="flex mt-3">
                <span className="text-emerald-600/80">
                  {"// Connection established. Ready to track. ⚡"}
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
        <div className="absolute inset-0 grid-bg opacity-20 lg:hidden" />

        <div className="w-full max-w-sm relative z-10">
          <Link
            href="/"
            className="lg:hidden flex items-center justify-center gap-3 mb-10"
          >
            <Image src="/logo.svg" alt="Devpulse Logo" width={40} height={40} />
            <h2 className="text-3xl font-bold">Devpulse</h2>
          </Link>

          <div className="mb-8 text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Log in</h2>
            <p className="text-gray-500">
              Enter your credentials to access your account.
            </p>
          </div>

          <LoginForm />

          <div className="mt-6 flex items-center gap-3 text-sm text-indigo-600/90">
            <Link
              href={
                redirectTo
                  ? `/forgot-password?redirect=${encodeURIComponent(redirectTo)}`
                  : "/forgot-password"
              }
              className="font-semibold transition-colors hover:text-indigo-200 underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
