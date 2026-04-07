"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function DashboardWithoutKey({ email }: { email: string }) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  const WAKATIME_KEY_REGEX = /^waka_[0-9a-f-]{36}$/i;

  const testApiKey = async (apiKey: string) => {
    const response = await fetch(
      `/api/wakatime/sync?apiKey=${encodeURIComponent(apiKey)}`,
    );
    return response.ok;
  };

  const saveKey = async () => {
    const nextKey = key.trim();

    if (!nextKey || !WAKATIME_KEY_REGEX.test(nextKey)) {
      toast.error("Please enter a valid WakaTime API key.");
      return;
    }

    setLoading(true);

    const keyRequest = new Promise<void>(async (resolve, reject) => {
      try {
        const isValid = await testApiKey(nextKey);
        if (!isValid)
          return reject(
            new Error("Invalid API key. Please check and try again."),
          );

        resolve();
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(keyRequest, {
      pending: "Please wait while we validate and save your API key...",
      success: "API key saved! Redirecting...",
      error: {
        render({ data }) {
          setLoading(false);
          const err = data as Error;
          return err?.message || "Failed to login. Please try again.";
        },
      },
    });

    keyRequest.then(() => {
      window.location.reload();
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto" data-aos="fade-up">
      <div className="glass-card p-4 md:p-5 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-indigo-300/90 font-semibold mb-2">
              Account Setup
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Complete your account
            </h1>
            <p className="text-sm md:text-base text-gray-400 mt-2">
              Connect WakaTime to unlock your dashboard insights, rankings, and
              coding activity trends.
            </p>
          </div>

          <span className="inline-flex h-fit items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
            Step 1 of 1
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4" data-aos="fade-up" data-aos-delay="100">
        <div className="xl:col-span-8 glass-card p-5 md:p-6 border border-white/10">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 mb-4">
            <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">
              Account Email
            </p>
            <p className="text-white font-semibold truncate">{email}</p>
          </div>

          <label className="text-sm font-medium text-gray-300">WakaTime API Key</label>
          <input
            placeholder="Paste your WakaTime API key"
            className="input-field mt-2 mb-4"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={loading}
          />

          <button
            onClick={saveKey}
            disabled={loading || key.trim().length === 0}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
              loading || key.trim().length === 0
                ? "bg-gray-800 cursor-not-allowed opacity-60"
                : "btn-primary"
            }`}
          >
            {loading ? "Connecting..." : "Connect WakaTime"}
          </button>

          <p className="mt-4 text-sm text-gray-500 leading-relaxed">
            Get your API key from{" "}
            <Link
              href="https://wakatime.com/settings/account"
              target="_blank"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition"
            >
              WakaTime account settings
            </Link>
            .
          </p>
        </div>

        <div className="xl:col-span-4 glass-card p-5 md:p-6 border border-white/10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300 mb-4">
            What you unlock
          </h2>

          <div className="space-y-3 text-sm text-gray-300">
            <p>Daily and weekly coding performance charts.</p>
            <p>Language, editor, machine, and category insights.</p>
            <p>Leaderboard participation and progress tracking.</p>
          </div>

          <div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-1">
              Security Note
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your key is used only to sync your coding data and can be updated
              anytime in settings.
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        New account setup is almost done. Connect WakaTime to finish onboarding and start using your full dashboard.
      </p>
    </div>
  );
}
