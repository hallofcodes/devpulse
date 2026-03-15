"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createClient } from "../lib/supabase/client";
import Link from "next/link";
import { useState } from "react";
import { faKey, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

export default function BoardList({
  board,
}: {
  board: { id: string; name: string; slug: string; join_code: string };
}) {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    const supabase = await createClient();
    const { error } = await supabase
      .from("leaderboards")
      .delete()
      .eq("id", board.id);

    if (error) setShowDeleteModal(false);
    window.location.reload();
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <FontAwesomeIcon icon={faTrash} className="text-xs" />
          </button>
          <button
            onClick={() => {
              setSelectedCode(board.join_code);
              setShowCodeModal(true);
            }}
            className="p-2 rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
          >
            <FontAwesomeIcon icon={faKey} className="text-xs" />
          </button>
        </div>
      </div>

      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
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
