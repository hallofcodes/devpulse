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
  faProjectDiagram,
  faGear,
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
    href: "/d/admin",
    label: "Dashboard",
    icon: faDashboard,
    role: "admin",
    category: "admin",
  },
  {
    href: "/d",
    label: "Dashboard",
    icon: faChartLine,
    role: "user",
    category: "dev",
  },
  {
    href: "/d/chat",
    label: "Chat",
    icon: faMessage,
    role: "user",
    category: "dev",
  },
  {
    href: "/d/kanban",
    label: "Kanban",
    icon: faProjectDiagram,
    role: "user",
    category: "dev",
  },
  {
    href: "/d/flex",
    label: "Flex",
    icon: faCrown,
    role: "user",
    category: "dev",
  },
  {
    href: "/d/leaderboards",
    label: "Leaderboards",
    icon: faTrophy,
    role: "user",
    category: "dev",
  },
  {
    href: "/d/settings",
    label: "Settings",
    icon: faGear,
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
    href: "https://www.hallofcodes.org",
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
  avatar: string | null;
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
    <div className="min-h-screen ">
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b border-gray-200 bg-white">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md hover:bg-gray-100"
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
          bg-white border-r border-gray-200
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
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Devpulse" width={22} height={22} />
            <span className="text-sm font-semibold">Devpulse</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {groupedNavItems.map((item, idx) => (
            <div key={item.href}>
              {item.showCategory && (
                <p
                  className={`text-[10px] uppercase tracking-[0.15em] text-gray-600 font-semibold px-3 mb-3 ${
                    idx !== 0 ? "mt-5" : ""
                  }`}
                >
                  {item.category}
                </p>
              )}
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition
                  ${
                    pathname === item.href
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                  }`}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                title={item.label}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className={`w-4 h-4 ${
                    pathname === item.href ? "text-blue-600" : "text-gray-600"
                  }`}
                />
                {item.label}
              </Link>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
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
