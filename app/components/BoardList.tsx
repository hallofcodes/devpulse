"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createClient } from "../lib/supabase/client";
import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { faKey, faRotateRight, faTrashAlt, faChevronRight, faServer, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { Leaderboard } from "./dashboard/LeaderbordList";
import { User } from "@supabase/supabase-js";

export default function BoardList({
  user,
  board,
  allowLeave = false,
}: {
  user: User;
  board: Leaderboard;
  /** When true (joined networks only), show Leave to remove membership */
  allowLeave?: boolean;
}) {
  const supabase = createClient();
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const inviteUrl =
    typeof window !== "undefined" && selectedCode
      ? `${window.location.origin}/join?id=${selectedCode}`
      : "";
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleDelete = async () => {
    const { error } = await supabase
      .from("leaderboards")
      .delete()
      .eq("id", board.id);

    if (error) setShowDeleteModal(false);
    window.location.reload();
  };

  const handleLeave = async () => {
    setLeaving(true);
    const { error } = await supabase
      .from("leaderboard_members")
      .delete()
      .eq("leaderboard_id", board.id)
      .eq("user_id", user.id);

    setLeaving(false);
    setShowLeaveModal(false);

    if (error) {
      toast.error(error.message || "Could not leave this leaderboard.");
      return;
    }
    toast.success("You left the leaderboard.");
    window.location.reload();
  };

  const regenerateJoinCode = (boardId: string) => {
    const generateJoinCode = new Promise(async (resolve, reject) => {
      try {
        const joinCode = crypto.randomUUID().slice(0, 8);
        const { data, error } = await supabase
          .from("leaderboards")
          .update({ join_code: joinCode })
          .eq("id", boardId)
          .select()
          .single();

        if (error) return reject(error);

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(generateJoinCode, {
      pending: "Generating new join code...",
      success: "Successfully generated new join code.",
      error: {
        render({ data }) {
          const err = data as Error;
          return (
            err?.message ||
            "Failed to generate new join code. Please try again."
          );
        },
      },
    });
  };

  const getJoinCode = (boardId: string) => {
    const joinCode: Promise<{ join_code: string }[]> = new Promise(
      async (resolve, reject) => {
        try {
          const { data, error } = await supabase
            .from("leaderboards")
            .select("join_code")
            .eq("id", boardId)

          if (error) return reject(error);

          resolve(data);
        } catch (error) {
          reject(error);
        }
      },
    );

    toast.promise(joinCode, {
      pending: "Getting join code...",
      error: {
        render({ data }) {
          const err = data as Error;
          return err?.message || "Failed to get join code. Please try again.";  
        },
      },
    });

    joinCode.then((data) => {
      setSelectedCode(data[0].join_code);
      setShowCodeModal(true);
    });
  };

  return (
    <>
      <div className="flex justify-between items-center group/card p-4 sm:p-5">
        <Link href={`/leaderboard/${board.slug}`} className="flex-1 flex items-center min-w-0 pr-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center shrink-0 mr-4 shadow-sm group-hover/card:border-indigo-500/30 transition-colors">
            <FontAwesomeIcon icon={faServer} className="text-gray-400 group-hover/card:text-indigo-400 transition-colors w-4 h-4" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-200 group-hover/card:text-white transition-colors tracking-tight truncate text-[15px]">
                {board.name}
              </p>
            </div>
            <p className="text-[11px] text-gray-500 font-mono tracking-wider truncate mt-0.5 group-hover/card:text-indigo-300/70 transition-colors">
              /{board.slug}
            </p>
          </div>
          
          <div className="hidden sm:flex w-8 h-8 rounded-full border border-white/5 bg-white/5 items-center justify-center opacity-0 -translate-x-4 group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-all duration-300 ml-4">
            <FontAwesomeIcon icon={faChevronRight} className="text-indigo-400 w-3 h-3" />
          </div>
        </Link>

        {user.id === board.owner_id && (
          <div className="flex items-center gap-1 sm:gap-2 ml-2 pl-4 border-l border-white/10 shrink-0">
            <button
              onClick={() => getJoinCode(board.id)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
              title="View Join Code"
            >
              <FontAwesomeIcon icon={faKey} className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => regenerateJoinCode(board.id)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
              title="Regenerate Join Code"
            >
              <FontAwesomeIcon icon={faRotateRight} className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete Leaderboard"
            >
              <FontAwesomeIcon icon={faTrashAlt} className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {allowLeave && user.id !== board.owner_id && (
          <div className="flex items-center gap-1 sm:gap-2 ml-2 pl-4 border-l border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setShowLeaveModal(true)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
              title="Leave leaderboard"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {showCodeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-card p-8 w-full max-w-sm relative shadow-2xl border-indigo-500/20">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
            
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-indigo-400 mb-6 text-center flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faKey} /> Share Server
            </h3>

            <div className="space-y-5">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                  Join Code
                </p>
                <div className="bg-black/50 border border-white/10 rounded-xl p-4 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-2xl font-mono text-white tracking-[0.2em] font-bold relative z-10">
                    {selectedCode}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                  Invite URL
                </p>
                <div className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 flex items-center gap-2">
                  <span className="flex-1 truncate">{inviteUrl}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!inviteUrl) return;
                      navigator.clipboard.writeText(inviteUrl);
                      toast.success("Invite link copied");
                    }}
                    className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowCodeModal(false)}
                className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaveModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-card p-8 w-full max-w-sm relative shadow-2xl border-amber-500/20">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
            <h3 className="text-lg font-bold text-gray-200 mb-2">Leave leaderboard?</h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              You&apos;ll be removed from{" "}
              <span className="font-mono text-gray-300 bg-white/5 px-1 rounded">{board.name}</span>.
              You can rejoin later with an invite link or code.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                disabled={leaving}
                className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLeave}
                disabled={leaving}
                className="flex-1 py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              >
                {leaving ? "Leaving…" : "Leave"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-card p-8 w-full max-w-sm relative shadow-2xl border-red-500/20">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl" />
            
            <h3 className="text-lg font-bold text-gray-200 mb-2">
              Delete Network
            </h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-mono text-gray-300 bg-white/5 px-1 rounded">{board.name}</span>? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-lg text-sm font-bold transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
