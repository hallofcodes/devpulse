"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createClient } from "../lib/supabase/client";
import Link from "next/link";
import { useState } from "react";
import { faKey, faRefresh, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { Leaderboard } from "./dashboard/LeaderbordList";
import { User } from "@supabase/supabase-js";

export default function BoardList({
  user,
  board,
}: {
  user: User;
  board: Leaderboard;
}) {
  const supabase = createClient();
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    const { error } = await supabase
      .from("leaderboards")
      .delete()
      .eq("id", board.id);

    if (error) setShowDeleteModal(false);
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
      <div
        key={board.id}
        className="stat-card flex justify-between items-center group"
      >
        <Link href={`/leaderboard/${board.slug}`} className="flex-1">
          <p className="font-medium text-gray-300 group-hover:text-indigo-400 transition">
            {board.name}
          </p>
        </Link>

        {user.id === board.owner_id && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition"
              title="Delete Leaderboard"
            >
              <FontAwesomeIcon icon={faTrash} className="text-xs" />
            </button>
            <button
              onClick={() => regenerateJoinCode(board.id)}
              className="p-2 rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
              title="Regenerate Join Code"
            >
              <FontAwesomeIcon icon={faRefresh} className="text-xs" />
            </button>
            <button
              onClick={() => getJoinCode(board.id)}
              className="p-2 rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
              title="View Join Code"
            >
              <FontAwesomeIcon icon={faKey} className="text-xs" />
            </button>
          </div>
        )}
      </div>

      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="glass-card p-8 w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">
              Join Code
            </h3>

            <div className="text-center text-3xl font-bold tracking-widest text-indigo-400 mb-6 py-4 stat-card">
              {selectedCode}
            </div>

            <button
              onClick={() => setShowCodeModal(false)}
              className="btn-secondary w-full py-2.5"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="glass-card p-8 w-[90%] max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">
              Delete Leaderboard?
            </h3>

            <div className="text-center text-xl font-bold text-indigo-400 mb-4 py-3 stat-card">
              {board.name}
            </div>

            <p className="text-red-400/80 text-sm italic mb-6 text-center">
              This action is irreversible.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary w-full py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete()}
                className="w-full py-2.5 rounded-xl font-semibold bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
