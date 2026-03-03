"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { toast } from "react-toastify";

export default function DashboardWithKey({ email }: { email: string }) {
  const supabase = createClient();
  const [leaderboardName, setLeaderboardName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const createLeaderboard = async () => {
    const createLeaderboard = new Promise(async (resolve, reject) => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (!user) return;

        const joinCode = crypto.randomUUID().slice(0, 8);

        const { data, error } = await supabase
          .from("leaderboards")
          .insert({
            name: leaderboardName,
            owner_id: user.id,
            join_code: joinCode,
            is_public: true,
          })
          .select()
          .single();

        if (error) return reject(error);

        // Automatically add creator as member
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
          return err?.message || "Failed to create. Please try again.";
        },
      },
    });
  };

  const joinLeaderboard = async () => {
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
    <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-gray-400 mt-2 text-sm">
          Logged in as <span className="text-indigo-400">{email}</span>
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-indigo-400">
          Create Leaderboard
        </h3>

        <input
          placeholder="Enter leaderboard name"
          className="w-full p-3 rounded-xl bg-black/40 border border-gray-700
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       transition mb-4"
          onChange={(e) => setLeaderboardName(e.target.value)}
        />

        <button
          onClick={createLeaderboard}
          className="w-full py-3 rounded-xl font-semibold
                       bg-gradient-to-r from-indigo-500 to-purple-600
                       hover:scale-[1.02] transition-transform duration-200
                       shadow-lg"
        >
          Create Leaderboard
        </button>
      </div>

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-gray-700" />
        <span className="text-gray-500 text-sm">OR</span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-purple-400">
          Join Leaderboard
        </h3>

        <input
          placeholder="Enter join code"
          className="w-full p-3 rounded-xl bg-black/40 border border-gray-700
                       focus:outline-none focus:ring-2 focus:ring-purple-500
                       transition mb-4"
          onChange={(e) => setJoinCode(e.target.value)}
        />

        <button
          onClick={joinLeaderboard}
          className="w-full py-3 rounded-xl font-semibold
                       bg-gray-800 hover:bg-gray-700
                       transition duration-200 shadow"
        >
          Join Leaderboard
        </button>
      </div>
    </div>
  );
}
