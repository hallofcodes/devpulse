"use client";

import {
  faArrowRightFromBracket,
  faChevronDown,
  faDashboard,
  faGear,
  faMessage,
  faRankingStar,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function NavProfileDropdown({
  avatar,
  name,
  email,
  type,
}: {
  avatar: string | null;
  name: string;
  email: string;
  type: "navbar" | "sidebar";
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const showDashboardLink = !pathname.includes("/dashboard");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="relative flex items-center gap-2 cursor-pointer"
      ref={profileRef}
      onClick={() => setProfileOpen(!profileOpen)}
    >
      {avatar ? (
        <Image
          src={avatar}
          alt="Profile Avatar"
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {email.charAt(0).toUpperCase()}
        </div>
      )}

      <div
        className={`${type === "sidebar" ? "flex-1" : "hidden"} items-center gap-2`}
      >
        <p className="text-sm font-semibold text-white truncate">{name}</p>
        <p className="text-xs text-gray-500 truncate">{email}</p>
      </div>

      <Link
        href="/logout"
        className={`${type === "sidebar" ? "flex" : "hidden"} items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mt-1 rounded`}
        onClick={() => setProfileOpen(false)}
      >
        <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-4 h-4" />
      </Link>

      {/* Dropdown Menu */}
      {profileOpen && (
        <div
          className={`${type === "sidebar" ? "left-0 bottom-full slide-in-from-bottom-2" : "right-0 top-full slide-in-from-top-2"} absolute mt-3 w-48 rounded-xl glass-card py-2 shadow-xl border border-gray-800/60 z-[100] animate-in fade-in duration-200`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 border-b border-gray-800/60 mb-2 md:hidden">
            <p className="text-sm font-medium text-white truncate">{name}</p>
            <p className="text-[10px] text-gray-500 truncate">{email}</p>
          </div>
          {showDashboardLink && (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <FontAwesomeIcon icon={faDashboard} className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/leaderboards"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <FontAwesomeIcon icon={faRankingStar} className="w-4 h-4" />
                Leaderboards
              </Link>
              <Link
                href="/dashboard/flex"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <FontAwesomeIcon icon={faStar} className="w-4 h-4" />
                Flex
              </Link>
              <Link
                href="/dashboard/chat"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <FontAwesomeIcon icon={faMessage} className="w-4 h-4" />
                Chat
              </Link>
            </>
          )}
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors"
            onClick={() => setProfileOpen(false)}
          >
            <FontAwesomeIcon icon={faGear} className="w-4 h-4" />
            Settings
          </Link>
          {type === "navbar" && (
            <Link
              href="/logout"
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mt-1"
              onClick={() => setProfileOpen(false)}
            >
              <FontAwesomeIcon
                icon={faArrowRightFromBracket}
                className="w-4 h-4"
              />
              Logout
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
