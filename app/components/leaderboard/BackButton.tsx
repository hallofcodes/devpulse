"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function BackButton({ href = "/dashboard/leaderboards" }: { href?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-indigo-400 transition-colors mb-6 group w-fit"
    >
      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
        <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
      </div>
      Back
    </button>
  );
}
