"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { createClient } from "../../lib/supabase/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Database } from "@/app/supabase-types";
import Banner from "./Banner";
import BackButton from "./BackButton";
import InviteFriendsButton from "./InviteFriendsButton";
import { useBadWords } from "@/app/hooks/useBadWords";
import { sanitizeTextWithBlocklist } from "@/app/utils/moderation";
import { toKebabSlug } from "@/app/utils/slug";

type LeaderboardRow = Database["public"]["Tables"]["leaderboards"]["Row"];

export default function LeaderboardHeader({
  leaderboard,
  isOwner,
}: {
  leaderboard: LeaderboardRow;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(leaderboard.name);
  const [description, setDescription] = useState(leaderboard.description || "");
  const { badWords } = useBadWords();

  const handleEdit = async () => {
    const sanitizedName = sanitizeTextWithBlocklist(name, badWords, "[redacted]");
    const sanitizedDescription = sanitizeTextWithBlocklist(
      description,
      badWords,
      "[redacted]",
    );

    const editLeaderboard: Promise<LeaderboardRow> = new Promise(
      async (resolve, reject) => {
        try {
          const supabase = await createClient();
          const slug = toKebabSlug(sanitizedName, "leaderboard");

          const { data, error } = await supabase
            .from("leaderboards")
            .update({
              name: sanitizedName,
              slug,
              description: sanitizedDescription,
            })
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
      <div className="group relative mb-20 sm:mb-24">
        {/* Using a temporary placeholder banner image */}
        <Banner name={leaderboard.name} imageUrl="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" />

        {/* Top actions overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-20 pointer-events-none">
          <div className="pointer-events-auto">
            <BackButton />
          </div>
        </div>
        
        <div className="absolute left-6 right-4 sm:left-8 sm:right-8 -bottom-14 sm:-bottom-16 flex items-end justify-between gap-3 sm:gap-6 z-10">
          <div className="flex items-end gap-3 sm:gap-6 flex-1 min-w-0">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-[#0a0a1a] p-1.5 sm:p-2 shadow-2xl shrink-0">
               <div className="w-full h-full rounded-xl bg-[#121226] border border-white/5 flex items-center justify-center overflow-hidden relative">
                 <Image src="/logo.svg" alt="DevPulse Logo" width={40} height={40} className="object-contain opacity-80 sm:w-[50px] sm:h-[50px]" />
               </div>
            </div>
            
            <div className="mb-2 sm:mb-3 max-w-[calc(100%-120px)] sm:max-w-xl">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 truncate">
                {leaderboard.name}
                {isOwner && (
                  <button
                    onClick={() => setOpen(true)}
                    className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-indigo-400 p-1 shrink-0"
                  >
                    <FontAwesomeIcon icon={faPencil} className="text-sm sm:text-[16px]" />
                  </button>
                )}
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base font-medium truncate sm:whitespace-normal leading-relaxed">
                {leaderboard.description && leaderboard.description?.length > 0 
                  ? leaderboard.description
                  : `Join ${leaderboard.name} to track your coding metrics, compete with fellow developers, and showcase your engineering skills.`}
              </p>
            </div>
          </div>
          
          <div className="mb-2 sm:mb-3 shrink-0 scale-90 sm:scale-95 origin-bottom-right">
            <InviteFriendsButton joinCode={leaderboard?.join_code} leaderboardName={leaderboard.name} />
          </div>
        </div>
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
