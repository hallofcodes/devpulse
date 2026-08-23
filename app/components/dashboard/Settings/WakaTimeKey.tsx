"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faKey,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";

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
    <div className="glass-card p-5 relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
            <FontAwesomeIcon
              icon={faClock}
              className="w-3.5 h-3.5 text-gray-600"
            />
          </div>
          <h3 className="font-bold text-gray-900 tracking-tight">WakaTime</h3>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors disabled:opacity-50"
          >
            {isConnected ? "Update key" : "Connect"}
          </button>
        )}
      </div>

      {isConnected && displayMaskedKey && !isEditing && (
        <div className="flex items-center gap-2 mb-1 text-xs text-gray-500 font-mono">
          <FontAwesomeIcon icon={faKey} className="w-3 h-3 text-gray-400" />
          {displayMaskedKey}
        </div>
      )}

      {!isConnected && !isEditing && (
        <p className="text-xs text-gray-500 mb-1">
          Connect your account to sync your coding activity.
        </p>
      )}

      {isEditing && (
        <div className="mt-3 space-y-3 animate-[fadeIn_0.15s_ease-out]">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
              API key
            </label>
            <input
              type="password"
              placeholder="waka_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="input-field font-mono text-sm"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={saving}
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={saveKey}
              disabled={saving || key.trim().length === 0}
              className={`btn-primary ${
                saving || key.trim().length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {saving ? "Saving..." : "Save API Key"}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100">
        <Link
          href="https://wakatime.com/settings/account"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Find your key in WakaTime settings
          <FontAwesomeIcon
            icon={faArrowUpRightFromSquare}
            className="w-2.5 h-2.5"
          />
        </Link>
      </div>
    </div>
  );
}
