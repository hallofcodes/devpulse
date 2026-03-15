"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { createClient } from "../../lib/supabase/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Leaderboard = {
  id: string;
  name: string;
  description: string;
  slug: string;
};

export default function LeaderboardHeader({
  leaderboard,
  isOwner,
}: {
  leaderboard: { id: string; name: string; description: string };
  isOwner: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(leaderboard.name);
  const [description, setDescription] = useState(leaderboard.description || "");

  const handleEdit = async () => {
    const editLeaderboard: Promise<Leaderboard> = new Promise(
      async (resolve, reject) => {
        try {
          const supabase = await createClient();
          const slug = name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "");

          const { data, error } = await supabase
            .from("leaderboards")
            .update({ name, slug, description })
            .eq("id", leaderboard.id)
            .select()
            .single();

          if (error) return reject(error);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      },
    );

    toast.promise(editLeaderboard, {
      pending: "Editing leaderboard...",
      success: "Leaderboard updated!",
      error: {
        render({ data }) {
          const err = data as Error;
          if (err?.code === "23505") {
            return "A leaderboard with that name already exists.";
          }
          return err?.message || "Failed to edit. Please try again.";
        },
      },
    });

    editLeaderboard.then((data) => {
      router.push(`/leaderboard/${data.slug}`);
    });
  };

  return (
    <>
      <div className="group relative mb-8 text-center">
        <div className="flex justify-center items-center gap-3">
          <Image src="/logo.svg" alt="DevPulse Logo" width={36} height={36} />
          <h1 className="text-3xl font-bold text-white">{leaderboard.name}</h1>

          {isOwner && (
            <button
              onClick={() => setOpen(true)}
              className="opacity-0 group-hover:opacity-100 transition text-gray-600 hover:text-indigo-400 p-1.5"
            >
              <FontAwesomeIcon icon={faPencil} className="text-sm" />
            </button>
          )}
        </div>

        <p className="text-gray-500 mt-2 text-sm">
          {leaderboard.description?.length > 0
            ? leaderboard.description
            : "No description available."}
        </p>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-8 w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">
              Edit Leaderboard
            </h3>

            <input
              className="input-field mb-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Leaderboard name"
            />

            <textarea
              className="input-field mb-4 min-h-[80px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="btn-secondary w-full py-2.5"
              >
                Cancel
              </button>

              <button
                onClick={handleEdit}
                className="btn-primary w-full py-2.5"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
