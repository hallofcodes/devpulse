"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function VerifyWakatime() {
  const [apiKey, setApiKey] = useState("");
  const [grecaptchaLoaded, setGrecaptchaLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadGrecaptcha = () => {
      const scriptId = "recaptcha-enterprise";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
        script.async = true;
        script.onload = () => setGrecaptchaLoaded(true);
        document.body.appendChild(script);
      } else {
        setGrecaptchaLoaded(true);
      }
    };

    loadGrecaptcha();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grecaptchaLoaded || !window.grecaptcha?.enterprise) {
      toast.error(
        "Recaptcha Enterprise is not loaded. Please try again later.",
      );
      return;
    }

    setLoading(true);

    const verifyWakatimePromise = new Promise<void>(async (resolve, reject) => {
      try {
        const wakatimeSyncResponse = await fetch(
          `/api/wakatime/sync?apiKey=${encodeURIComponent(apiKey)}`,
        );
        if (!wakatimeSyncResponse.ok)
          throw new Error("Failed to sync Wakatime.");

        resolve();
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(verifyWakatimePromise, {
      pending: "Verifying...",
      success: "Verification successful!",
      error: {
        render({ data }) {
          const err = data as Error;
          return err?.message || "Failed to verify. Please try again.";
        },
      },
    });

    verifyWakatimePromise
      .then(() => {
        router.push("/d");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex grid-bg relative">
      {/* Left Side - Visual / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 md:p-16 xl:p-24 border-r border-gray-200 bg-slate-800 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />

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
            Last step away from your dashboard.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            We need you to input your Wakatime API key to complete the
            verification.
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
                <span className="text-yellow-700">verifyWakatime</span>
                <span className="text-gray-700">(</span>
                <span className="text-green-600">apiKey</span>
                <span className="text-gray-700">);</span>
              </div>
              <div className="flex mt-2">
                <span className="text-blue-600">user</span>
                <span className="text-gray-700">.</span>
                <span className="text-yellow-700">verifyWakatime</span>
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
            <Image src="/apple-touch-icon.png" alt="Devpulse Logo" width={40} height={40} />
            <h2 className="text-3xl font-bold text-gray-900">Devpulse</h2>
          </Link>

          <div className="text-center mb-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-8 w-8 text-blue-600"
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
              Wakatime Verification
            </h2>
            <p className="text-gray-500">
              We need you to enter your Wakatime API Key to connect your account
              to Devpulse.
            </p>
          </div>

          <div className="space-y-4">
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="api_key"
                name="api_key"
                autoComplete="text"
                placeholder="Enter your Wakatime API Key"
                className="input-field"
                onChange={(e) => setApiKey(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Connect to Wakatime
              </button>

              <Link
                href="/logout"
                className="block text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Changed your mind? Log in again.
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
