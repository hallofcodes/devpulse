"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function DashboardWithoutKey({ email }: { email: string }) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  const saveKey = async () => {
    setLoading(true);

    const saveKey = new Promise(async (resolve, reject) => {
      try {
        if (!key.trim() || !/^waka_[0-9a-f-]{36}$/i.test(key))
          return reject(new Error("Please enter a valid WakaTime API key."));

        const isValid = await testApiKey(key);
        if (!isValid)
          return reject(
            new Error("Invalid API key. Please check and try again."),
          );

        resolve(isValid);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(saveKey, {
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

    saveKey.then(() => {
      window.location.reload();
    });
  };

  const testApiKey = async (apiKey: string) => {
    const response = await fetch(
      `/api/wakatime/sync?apiKey=${encodeURIComponent(apiKey)}`,
    );
    return response.ok;
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div data-aos="fade-up">
        <h1 className="text-2xl font-bold text-white">Connect Wakatime</h1>
        <p className="text-sm text-gray-600">
          Connect your WakaTime account to DevPulse to visualize your coding
          activity
        </p>
      </div>

      <div className="glass-card p-6 max-w-xl" data-aos="fade-up" data-aos-delay="100">
        <p className="text-gray-400 mb-8 text-sm">
          Welcome <span className="text-white font-medium">{email}</span>. Enter
          your WakaTime API key to activate your DevPulse dashboard.
        </p>

        <input
          placeholder="Enter your WakaTime API Key"
          className="input-field mb-4"
          onChange={(e) => setKey(e.target.value)}
        />

        <button
          onClick={saveKey}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
            loading
              ? "bg-gray-800 cursor-not-allowed opacity-60"
              : "btn-primary"
          }`}
        >
          {loading ? "Saving..." : "Save API Key"}
        </button>

        <p className="mt-6 text-sm text-gray-500 leading-relaxed mb-3">
          You can get your WakaTime API key from your{" "}
          <Link
            href="https://wakatime.com/settings/account"
            target="_blank"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition"
          >
            account settings
          </Link>{" "}
          on WakaTime.
        </p>
      </div>
    </div>
  );
}
