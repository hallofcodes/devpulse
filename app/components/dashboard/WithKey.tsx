"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { toast } from "react-toastify";

export default function DashboardWithKey() {
  const supabase = createClient();
  const [leaderboardName, setLeaderboardName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const createLeaderboard = async () => {
    if (leaderboardName.trim().length === 0)
      return toast.error("Please enter a leaderboard name.");
    if (leaderboardName.trim().length < 3)
      return toast.error("Leaderboard name must be at least 3 characters.");
    if (leaderboardName.length > 50)
      return toast.error("Leaderboard name must be under 50 characters.");

    const createLeaderboard = new Promise(async (resolve, reject) => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (!user) return;

        const joinCode = crypto.randomUUID().slice(0, 8);
        const slug = leaderboardName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "");

        const { data, error } = await supabase
          .from("leaderboards")
          .insert({
            name: leaderboardName,
            description: "",
            slug,
            owner_id: user.id,
            join_code: joinCode,
            is_public: true,
          })
          .select()
          .single();

        if (error) return reject(error);

        await supabase.from("leaderboard_members").insert({
          leaderboard_id: data.id,
          user_id: user.id,
          role: "owner",
        });

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(createLeaderboard, {
      pending: "Creating leaderboard...",
      success: {
        render() {
          window.location.reload();
          return "Leaderboard created!";
        },
      },
      error: {
        render({ data }) {
          const err = data as Error;
          if (err?.code === "23505") {
            return "A leaderboard with that name already exists.";
          }
          return err?.message || "Failed to create. Please try again.";
        },
      },
    });
  };

  const joinLeaderboard = async () => {
    if (joinCode.trim().length === 0)
      return toast.error("Please enter a join code.");
    if (joinCode.trim().length !== 8)
      return toast.error("Join code must be 8 characters long.");

    const joinLeaderboard = new Promise(async (resolve, reject) => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) return;

        const { data: board } = await supabase
          .from("leaderboards")
          .select("id")
          .eq("join_code", joinCode)
          .single();

        if (!board) throw new Error("Invalid join code");

        const { error } = await supabase.from("leaderboard_members").insert({
          leaderboard_id: board.id,
          user_id: user.id,
        });

        if (error) return reject(error);

        resolve(board);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(joinLeaderboard, {
      pending: "Joining leaderboard...",
      success: {
        render() {
          window.location.reload();
          return "Joined leaderboard!";
        },
      },
      error: {
        render({ data }) {
          const err = data as Error;
          if (err?.code === "23505") {
            return "You are already a member of this leaderboard.";
          }
          return err?.message || "Failed to join. Please try again.";
        },
      },
    });
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-5">
        Manage Leaderboards
      </h3>

      {/* Create */}
      <div className="space-y-3 mb-6">
        <label className="text-sm text-gray-400 font-medium">Create New</label>
        <div className="flex gap-2">
          <input
            placeholder="Leaderboard name"
            className="input-field flex-1"
            onChange={(e) => setLeaderboardName(e.target.value)}
          />
          <button onClick={createLeaderboard} className="btn-primary px-5 py-2.5 text-sm whitespace-nowrap">
            Create
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-gray-700 text-xs uppercase tracking-wider">or join</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Join */}
      <div className="space-y-3">
        <label className="text-sm text-gray-400 font-medium">Join Existing</label>
        <div className="flex gap-2">
          <input
            placeholder="Enter 8-character code"
            className="input-field flex-1 font-mono"
            maxLength={8}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button
            onClick={joinLeaderboard}
            className="btn-secondary px-5 py-2.5 text-sm whitespace-nowrap"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
