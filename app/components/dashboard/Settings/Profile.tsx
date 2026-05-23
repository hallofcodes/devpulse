"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { toast } from "react-toastify";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import { useBadWords } from "@/app/hooks/useBadWords";
import { sanitizeTextWithBlocklist } from "@/app/utils/moderation";

export default function UserProfile({ user }: { user: User }) {
  const supabase = createClient();
  const initialName =
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";
  const [originalName, setOriginalName] = useState(initialName);
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { badWords } = useBadWords();
  const preferredAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.avatar ||
    "/logo.svg";

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

    const updateUserProfile = new Promise(async (resolve, reject) => {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { name: sanitizedName },
        });

        if (error) return reject(error);
        resolve("Profile updated!");
      } catch (error) {
        reject(error);
      }
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
      const nextName = sanitizedName;
      setLoading(false);
      setOriginalName(nextName);
      setName(nextName);
      setIsEditing(false);
    });
  }

  return (
    <div className="glass-card p-5 border-t-4 border-indigo-500/50">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">
            Account Profile
          </h3>
          <p className="text-xs md:text-sm text-gray-400 mt-1.5">
            Keep your profile details accurate for a better dashboard experience.
          </p>
        </div>

        <button
          type="button"
          onClick={() => (isEditing ? cancelEditing() : setIsEditing(true))}
          disabled={loading}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Image
          src={preferredAvatar}
          alt="User Avatar"
          width={54}
          height={54}
          className="rounded-full border border-white/10"
        />
        <div>
          <p className="text-white font-semibold leading-none mb-1">{originalName}</p>
          <p className="text-xs text-gray-500">{user.email || "No email"}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs md:text-sm text-gray-400 font-medium">Display Name</label>
          <input
            type="text"
            className={`input-field mt-1 ${!isEditing ? "opacity-70" : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isEditing || loading}
          />
        </div>

        <div>
          <label className="text-xs md:text-sm text-gray-400 font-medium">Email</label>
          <input
            type="email"
            className="input-field mt-1 opacity-70"
            value={user.email || ""}
            disabled
          />
        </div>
      </div>

      {isEditing ? (
        <div className="mt-4 flex items-center gap-2.5">
          <button
            onClick={updateProfile}
            disabled={!isEdited || loading}
            className={`btn-primary ${!isEdited || loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={cancelEditing}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Discard
          </button>
        </div>
      ) : (
        <p className="mt-4 text-xs text-gray-500">
          Profile fields are locked. Click Edit to make changes.
        </p>
      )}
    </div>
  );
}
