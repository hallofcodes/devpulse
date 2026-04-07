"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

export default function InviteFriendsButton({ joinCode, leaderboardName }: { joinCode?: string; leaderboardName?: string }) {
  const handleInvite = () => {
    if (typeof window !== "undefined") {
      const inviteUrl = joinCode
        ? `${window.location.origin}/join/${joinCode}`
        : window.location.href; // fallback

      const message = leaderboardName
        ? `Join my coding leaderboard "${leaderboardName}" on DevPulse!\n\nTrack metrics, compete with fellow developers, and showcase your engineering skills.\n\nJoin here: ${inviteUrl}`
        : `Join my coding leaderboard on DevPulse!\n\nJoin here: ${inviteUrl}`;

      navigator.clipboard.writeText(message);
      toast.success("Invite message copied to clipboard!");
    }
  };

  return (
    <button
      onClick={handleInvite}
      className="flex items-center gap-2 text-sm font-medium bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 hover:text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-lg transition-all"
    >
      <FontAwesomeIcon icon={faShareNodes} className="w-4 h-4" />
      Invite Friends
    </button>
  );
}
