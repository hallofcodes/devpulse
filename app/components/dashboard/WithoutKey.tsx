"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";

export default function DashboardWithoutKey({ email }: { email: string }) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  const saveKey = async () => {
    setLoading(true);

    const saveKey = new Promise(async (resolve, reject) => {
      try {
        const wakatimeApiKeyRegex =
          /^waka_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!key.trim() || !wakatimeApiKeyRegex.test(key))
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
      router.refresh();
    });
  };

  const testApiKey = async (apiKey: string) => {
    const response = await fetch(
      `/api/wakatime/sync?apiKey=${encodeURIComponent(apiKey)}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(apiKey).toString("base64")}`,
        },
      },
    );
    return response.ok;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] text-white px-4 grid-bg relative">
      <div className="glow-orb w-[400px] h-[400px] bg-indigo-600/10 top-1/4 left-1/2 -translate-x-1/2" />

      <div className="glass-card p-10 w-full max-w-md relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <Image src="/logo.svg" alt="DevPulse Logo" width={36} height={36} />
          <h2 className="text-2xl font-bold gradient-text">
            Connect WakaTime
          </h2>
        </div>

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

        <Link
          href="/logout"
          className="text-sm text-gray-500 hover:text-gray-300 transition"
        >
          Logout
        </Link>
      </div>
    </div>
  );
}
