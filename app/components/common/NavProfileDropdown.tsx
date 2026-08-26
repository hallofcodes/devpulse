"use client";

import {
  faArrowRightFromBracket,
  faDashboard,
  faGear,
  faMessage,
  faProjectDiagram,
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
  const showDashboardLink = !pathname.includes("/d");

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
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {email.charAt(0).toUpperCase()}
        </div>
      )}

      <div
        className={`${type === "sidebar" ? "flex-1" : "hidden"} items-center gap-2`}
      >
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-500 truncate">{email}</p>
      </div>

      <Link
        href="/logout"
        className={`${type === "sidebar" ? "flex" : "hidden"} items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors mt-1 rounded`}
        onClick={() => setProfileOpen(false)}
      >
        <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-4 h-4" />
      </Link>

      {/* Dropdown Menu */}
      {profileOpen && (
        <div
          className={`${type === "sidebar" ? "left-0 bottom-full slide-in-from-bottom-2" : "right-0 top-full slide-in-from-top-2"} absolute mt-3 w-48 rounded-xl glass-card py-2 shadow-xl border border-gray-200 z-[100] animate-in fade-in duration-200`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 border-b border-gray-200 mb-2 md:hidden">
            <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
            <p className="text-[10px] text-gray-500 truncate">{email}</p>
          </div>
          {showDashboardLink && (
            <>
              <Link
                href="/d"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <FontAwesomeIcon icon={faDashboard} className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/d/chat"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <FontAwesomeIcon icon={faMessage} className="w-4 h-4" />
                Chat
              </Link>
              <Link
                href="/d/kanban"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <FontAwesomeIcon icon={faProjectDiagram} className="w-4 h-4" />
                Kanban
              </Link>
              <Link
                href="/d/flex"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <FontAwesomeIcon icon={faStar} className="w-4 h-4" />
                Flex
              </Link>
              <Link
                href="/d/leaderboards"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                <FontAwesomeIcon icon={faRankingStar} className="w-4 h-4" />
                Leaderboards
              </Link>
            </>
          )}
          <Link
            href="/d/settings"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setProfileOpen(false)}
          >
            <FontAwesomeIcon icon={faGear} className="w-4 h-4" />
            Settings
          </Link>
          
          {type === "navbar" && (
            <Link
              href="/logout"
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors mt-1"
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
