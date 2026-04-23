"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightToBracket,
  faCheck,
  faSpinner,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

export default function JoinButton({
  code,
  leaderboardSlug,
  isLoggedIn,
  alreadyMember,
}: {
  code: string;
  leaderboardSlug: string;
  isLoggedIn: boolean;
  alreadyMember: boolean;
}) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);

  if (alreadyMember) {
    return (
      <Link
        href={`/leaderboard/${leaderboardSlug}`}
        className="btn-primary inline-flex items-center justify-center gap-2 w-full py-4 text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20"
      >
        <FontAwesomeIcon icon={faCheck} className="w-5 h-5" />
        <span className="sm:hidden">View</span>
        <span className="hidden sm:inline">View Leaderboard</span>
      </Link>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-3">
        <Link
          href={`/login?redirect=${encodeURIComponent(`/join?id=${code}`)}`}
          className="btn-primary inline-flex items-center justify-center gap-2 w-full py-4 text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20"
        >
          <FontAwesomeIcon icon={faArrowRightToBracket} className="w-5 h-5" />
          Log In to Join
        </Link>
        <p className="text-xs text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href={`/signup?redirect=${encodeURIComponent(`/join?id=${code}`)}`} className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign up free
          </Link>
        </p>
      </div>
    );
  }

  const handleJoin = async () => {
    setJoining(true);
    const supabase = createClient();

    const joinPromise = (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Not authenticated");

      const { data: board } = await supabase
        .from("leaderboards")
        .select("id")
        .eq("join_code", code)
        .single();

      if (!board) throw new Error("Invalid invite code");

      const { data: existingMembership } = await supabase
        .from("leaderboard_members")
        .select("id")
        .eq("leaderboard_id", board.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingMembership) {
        return { alreadyMember: true };
      }

      const { error } = await supabase.from("leaderboard_members").insert({
        leaderboard_id: board.id,
        user_id: user.id,
      });

      if (error) throw error;
      return { alreadyMember: false };
    })();

    try {
      await toast.promise(joinPromise, {
        pending: "Joining leaderboard...",
        success: {
          render({ data }) {
            const payload = data as { alreadyMember: boolean };
            return payload.alreadyMember
              ? "You're already a member. Opening leaderboard..."
              : "You're in! Welcome to the leaderboard.";
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

      router.push(`/leaderboard/${leaderboardSlug}`);
    } finally {
      setJoining(false);
    }
  };

  return (
    <button
      onClick={handleJoin}
      disabled={joining}
      className="btn-primary inline-flex items-center justify-center gap-2 w-full py-4 text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {joining ? (
        <>
          <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" />
          Joining...
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faUserPlus} className="w-5 h-5" />
          Accept Invite &amp; Join
        </>
      )}
    </button>
  );
}
