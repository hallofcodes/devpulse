"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { useBadWords } from "@/app/hooks/useBadWords";
import { sanitizeTextWithBlocklist } from "@/app/utils/moderation";

interface UserShape {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export default function UserProfile({ user }: { user: UserShape }) {
  const initialName = user.name || user.email?.split("@")[0] || "User";
  const [originalName, setOriginalName] = useState(initialName);
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { badWords } = useBadWords();
  const preferredAvatar = user.image || "/logo.svg";

  const isEdited = name.trim() !== originalName.trim();

  const cancelEditing = () => {
    setName(originalName);
    setIsEditing(false);
  };

  async function updateProfile() {
    if (!isEdited || !isEditing) return;
    if (!name.trim()) {
      toast.error("Display name cannot be empty.");
      return;
    }

    const sanitizedName = sanitizeTextWithBlocklist(
      name.trim(),
      badWords,
      "[redacted]",
    ).trim();

    if (!sanitizedName) {
      toast.error("Display name cannot be empty.");
      return;
    }

    setLoading(true);

    const updateUserProfile = fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: sanitizedName }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    });

    toast.promise(updateUserProfile, {
      pending: "Updating profile...",
      success: "Profile updated!",
      error: {
        render({ data }) {
          setLoading(false);
          const err = data as Error;
          return err?.message || "Failed to update profile. Please try again.";
        },
      },
    });

    updateUserProfile.then(() => {
      setLoading(false);
      setOriginalName(sanitizedName);
      setName(sanitizedName);
      setIsEditing(false);
    });
  }

  return (
    <div className="glass-card p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
            <FontAwesomeIcon
              icon={faUser}
              className="w-3.5 h-3.5 text-gray-600"
            />
          </div>
          <h3 className="font-bold text-gray-900 tracking-tight">
            Account Profile
          </h3>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors disabled:opacity-50"
          >
            Edit
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Image
          src={preferredAvatar}
          alt="User Avatar"
          width={54}
          height={54}
          className="rounded-full border border-gray-200"
        />
        <div>
          <p className="text-gray-900 font-semibold leading-none mb-1.5">
            {originalName}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="w-3 h-3 text-gray-400"
            />
            {user.email || "No email"}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="mt-3 space-y-3 animate-[fadeIn_0.15s_ease-out]">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
              Display name
            </label>
            <input
              type="text"
              className="input-field text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
              Email
            </label>
            <input
              type="email"
              className="input-field text-sm opacity-70"
              value={user.email || ""}
              disabled
            />
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={updateProfile}
              disabled={!isEdited || loading}
              className={`btn-primary ${
                !isEdited || loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
