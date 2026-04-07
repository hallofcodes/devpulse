"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

const WAKATIME_KEY_REGEX = /^waka_[0-9a-f-]{36}$/i;

export default function WakaTimeKey({
  hasKey,
  maskedKey,
}: {
  hasKey: boolean;
  maskedKey: string | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(hasKey);
  const [displayMaskedKey, setDisplayMaskedKey] = useState(maskedKey);

  const cancelEditing = () => {
    setKey("");
    setIsEditing(false);
  };

  const saveKey = async () => {
    const nextKey = key.trim();

    if (!nextKey || !WAKATIME_KEY_REGEX.test(nextKey)) {
      toast.error("Please enter a valid WakaTime API key.");
      return;
    }

    setSaving(true);

    const updateKey = new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch(
          `/api/wakatime/sync?apiKey=${encodeURIComponent(nextKey)}&saveOnly=1`,
        );
        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          return reject(
            new Error(payload.error || "Failed to update API key."),
          );
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(updateKey, {
      pending: "Updating WakaTime API key...",
      success: "WakaTime API key updated successfully.",
      error: {
        render({ data }) {
          const err = data as Error;
          return err?.message || "Failed to update WakaTime API key.";
        },
      },
    });

    updateKey
      .then(() => {
        const masked = `${nextKey.slice(0, 8)}...${nextKey.slice(-4)}`;
        setKey("");
        setIsEditing(false);
        setIsConnected(true);
        setDisplayMaskedKey(masked);

        // Clear client cache so the next sync reflects the latest key.
        sessionStorage.removeItem("wakatimeStats");
        sessionStorage.removeItem("wakatimeStatsTime");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <div className="glass-card p-5 border-t-4 border-cyan-500/40">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xs font-semibold text-cyan-300 uppercase tracking-widest">
            WakaTime Connection
          </h3>
          <p className="text-xs md:text-sm text-gray-400 mt-1.5">
            Keep your token updated to sync coding activity accurately.
          </p>
        </div>

        <button
          type="button"
          onClick={() => (isEditing ? cancelEditing() : setIsEditing(true))}
          disabled={saving}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Current status:{" "}
        <span className={isConnected ? "text-emerald-400" : "text-amber-300"}>
          {isConnected ? "Connected" : "Not connected"}
        </span>
        {isConnected && displayMaskedKey ? (
          <span className="text-gray-500"> ({displayMaskedKey})</span>
        ) : null}
      </p>

      {isEditing ? (
        <>
          <input
            type="password"
            placeholder="Enter new WakaTime API key"
            className="input-field mb-4"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={saving}
          />

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={saveKey}
              disabled={saving || key.trim().length === 0}
              className={`btn-primary ${saving || key.trim().length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {saving ? "Saving..." : "Save API Key"}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Discard
            </button>
          </div>
        </>
      ) : (
        <p className="text-xs text-gray-500 mb-1">
          API key is locked. Click Edit to replace it.
        </p>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Find your key in{" "}
        <Link
          href="https://wakatime.com/settings/account"
          target="_blank"
          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
        >
          WakaTime account settings
        </Link>
        .
      </p>
    </div>
  );
}
