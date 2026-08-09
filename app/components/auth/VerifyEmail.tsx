"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function VerifyEmail({ sessionEmail }: { sessionEmail?: string | null }) {
  const searchParams = useSearchParams();

  const emailParam = searchParams.get("email");
  const error = searchParams.get("error");
  const email = emailParam || sessionEmail || "";

  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);

    const p = fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then((r) => {
      if (!r.ok) throw new Error("Failed to resend.");
    });

    toast.promise(p, {
      pending: "Sending...",
      success: "Verification email sent!",
      error: "Failed to resend. Please try again.",
    });

    p.finally(() => setResending(false));
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Left Side - Visual / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 md:p-16 xl:p-24 border-r border-gray-200 bg-slate-800 overflow-hidden">
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
            One step away from your dashboard.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            We sent a verification link to your inbox. Click it to activate your
            account and start tracking your coding pulse.
          </p>

          <div className="glass-card border border-gray-200 rounded-2xl p-5 bg-gray-50 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs font-mono text-gray-500">
                verify.ts
              </span>
            </div>
            <div className="space-y-1.5 font-mono text-sm">
              <div className="flex">
                <span className="text-purple-600 mr-2">await</span>
                <span className="text-blue-600">user</span>
                <span className="text-gray-700">.</span>
                <span className="text-yellow-700">verifyEmail</span>
                <span className="text-gray-700">(</span>
                <span className="text-green-600">token</span>
                <span className="text-gray-700">);</span>
              </div>
              <div className="flex mt-2">
                <span className="text-blue-600">user</span>
                <span className="text-gray-700">.</span>
                <span className="text-yellow-700">emailVerified</span>
                <span className="text-gray-700 mx-2">=</span>
                <span className="text-emerald-600">true</span>
                <span className="text-gray-700">;</span>
              </div>
              <div className="flex mt-3">
                <span className="text-emerald-600/80">
                  {"// Welcome aboard. ✓"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} Devpulse. All rights reserved.
        </div>
      </div>

      {/* Right Side */}
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

          {error ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {error === "expired"
                  ? "Link expired"
                  : "Invalid verification link"}
              </h2>
              <p className="text-gray-500 mb-8">
                {error === "expired"
                  ? "This verification link has expired. Request a new one below."
                  : "This verification link is invalid or has already been used."}
              </p>
              {email && (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full py-3 rounded-xl font-semibold btn-primary mb-4"
                >
                  {resending ? "Sending..." : "Resend verification email"}
                </button>
              )}
              <Link
                href="/login"
                className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                  <svg
                    className="h-8 w-8 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Check your inbox
                </h2>
                <p className="text-gray-500">
                  We sent a verification link to{" "}
                  {email ? (
                    <span className="font-medium text-gray-700">{email}</span>
                  ) : (
                    "your email address"
                  )}
                  . Click the link to activate your account.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                  <p>
                    Didn&apos;t receive it? Check your spam folder, or resend
                    the email below.
                  </p>
                </div>

                {email && (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full py-3 rounded-xl font-semibold btn-primary"
                  >
                    {resending ? "Sending..." : "Resend verification email"}
                  </button>
                )}

                <Link
                  href="/login"
                  className="block text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
