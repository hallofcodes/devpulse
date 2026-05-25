"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faTrophy,
  faMessage,
  faCrown,
  faDashboard,
  faGlobe,
  faEdit,
  faCodeBranch,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import NavProfileDropdown from "../common/NavProfileDropdown";

type NavItem = {
  href: string;
  label: string;
  icon: IconDefinition;
  role: string;
  category: "admin" | "dev" | "other";
};

const navItems: NavItem[] = [
  {
    href: "/dashboard/admin",
    label: "Dashboard",
    icon: faDashboard,
    role: "admin",
    category: "admin",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: faChartLine,
    role: "user",
    category: "dev",
  },
  {
    href: "/dashboard/chat",
    label: "Chat",
    icon: faMessage,
    role: "user",
    category: "dev",
  },
  {
    href: "/dashboard/flex",
    label: "Flex",
    icon: faCrown,
    role: "user",
    category: "dev",
  },
  {
    href: "/dashboard/leaderboards",
    label: "Leaderboards",
    icon: faTrophy,
    role: "user",
    category: "dev",
  },
  {
    href: "https://hallofcodes.github.io/html-editor",
    label: "HTML Editor",
    icon: faEdit,
    role: "user",
    category: "other",
  },
  {
    href: "https://github.com/hallofcodes/devpulse",
    label: "Contribute on GitHub",
    icon: faCodeBranch,
    role: "user",
    category: "other",
  },
  {
    href: "https://hallofcodes.github.io",
    label: "Hall of Codes",
    icon: faGlobe,
    role: "user",
    category: "other",
  },
];

export default function DashboardLayout({
  email,
  name,
  role,
  avatar,
  children,
}: {
  email: string;
  name: string;
  role: string;
  avatar: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const nextIsMobile = window.innerWidth < 768;
      setIsMobile(nextIsMobile);
      setSidebarOpen(!nextIsMobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const canSee = (itemRole: string, userRole: string) =>
    itemRole !== "admin" || userRole === "admin";

  const groupedNavItems = navItems
    .filter((item) => canSee(item.role, role))
    .reduce(
      (acc, item) => {
        const last = acc[acc.length - 1];
        const showCategory = !last || last.category !== item.category;
        acc.push({ ...item, showCategory });
        return acc;
      },
      [] as Array<NavItem & { showCategory: boolean }>,
    );

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b border-white/5 bg-[#0a0a1a]">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md hover:bg-white/5"
          aria-label="Open sidebar"
        >
          <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Devpulse" width={22} height={22} />
          <span className="text-sm font-semibold">Devpulse</span>
        </div>

        <NavProfileDropdown
          avatar={avatar}
          name={name}
          email={email}
          type="navbar"
        />
      </header>

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-40 h-full flex flex-col
          bg-[#0c0c24] border-r border-white/5
          transition-transform duration-200
          ${
            isMobile
              ? sidebarOpen
                ? "translate-x-0 w-72"
                : "-translate-x-full w-72"
              : "translate-x-0"
          }
      md:w-64`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Devpulse" width={22} height={22} />
            <span className="text-sm font-semibold">Devpulse</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {groupedNavItems.map((item) => (
            <div key={item.href}>
              {item.showCategory && (
                <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600 font-semibold px-3 mb-3">
                  {item.category}
                </p>
              )}

              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition
                  ${
                    pathname === item.href
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
                  }`}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                title={item.label}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className={`w-4 h-4 ${
                    pathname === item.href ? "text-indigo-400" : "text-gray-600"
                  }`}
                />
                {item.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <NavProfileDropdown
            avatar={avatar}
            name={name}
            email={email}
            type="sidebar"
          />
        </div>
      </aside>

      <main
        className="min-h-screen grid-bg relative overflow-x-hidden
          transition-[padding-left] duration-200
          md:pt-0
          md:pl-64
          pt-0"
      >
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
