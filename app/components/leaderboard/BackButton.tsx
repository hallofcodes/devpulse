"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function BackButton({
  href = "/d/leaderboards",
}: {
  href?: string;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-6 group w-fit"
    >
      <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-500/30 transition-all">
        <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
      </div>
      Back
    </button>
  );
}
