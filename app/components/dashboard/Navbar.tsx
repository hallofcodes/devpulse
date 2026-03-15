"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faTrophy,
  faRightFromBracket,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

const SidebarContext = createContext({ collapsed: false });

function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const { collapsed } = useContext(SidebarContext);

  const navItems: { href: string; label: string; icon: IconDefinition }[] = [
    { href: "/dashboard", label: "Dashboard", icon: faChartLine },
    { href: "/dashboard/leaderboards", label: "Leaderboards", icon: faTrophy },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
      style={{
        background: "linear-gradient(180deg, #0c0c24 0%, #080818 100%)",
        borderRight: "1px solid rgba(99, 102, 241, 0.06)",
      }}
    >
      <div
        className={`flex items-center ${collapsed ? "justify-center" : ""} gap-2.5 px-5 h-16 border-b border-white/5`}
      >
        <Image src="/logo.svg" alt="DevPulse" width={26} height={26} />
        {!collapsed && (
          <span className="text-base font-bold gradient-text">DevPulse</span>
        )}
      </div>

      <div
        className={`px-4 py-4 border-b border-white/5 ${collapsed ? "flex justify-center" : ""}`}
      >
        <div
          className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {email.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">
                {email.split("@")[0]}
              </p>
              <p className="text-[11px] text-gray-600 truncate">{email}</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {!collapsed && (
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-700 font-semibold px-3 mb-3">
            Menu
          </p>
        )}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              collapsed ? "justify-center" : ""
            } ${
              pathname === item.href
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
                : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
            }`}
            title={collapsed ? item.label : undefined}
          >
            <FontAwesomeIcon
              icon={item.icon}
              className={`w-4 h-4 shrink-0 ${
                pathname === item.href ? "text-indigo-400" : "text-gray-600"
              }`}
            />
            {!collapsed && item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <Link
          href="/logout"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-red-400 hover:bg-red-500/5 transition ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Logout" : undefined}
        >
          <FontAwesomeIcon
            icon={faRightFromBracket}
            className="w-4 h-4 shrink-0"
          />
          {!collapsed && "Logout"}
        </Link>
      </div>
    </aside>
  );
}

export default function DashboardLayout({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <div className="min-h-screen bg-[#0a0a1a] text-white">
        <Sidebar email={email} />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`fixed z-50 top-[18px] transition-all duration-300 w-6 h-6 rounded-full bg-[#0f0f28] border border-white/10 flex items-center justify-center hover:border-indigo-500/30 hover:text-indigo-400 text-gray-600 ${
            collapsed ? "left-[56px]" : "left-[228px]"
          }`}
        >
          <FontAwesomeIcon
            icon={collapsed ? faChevronRight : faChevronLeft}
            className="w-2.5 h-2.5"
          />
        </button>

        {/* Main Content */}
        <main
          className={`min-h-screen p-6 md:p-8 grid-bg relative transition-all duration-300 overflow-x-hidden ${
            collapsed ? "ml-[68px]" : "ml-[240px]"
          }`}
        >
          <div className="glow-orb w-[500px] h-[500px] bg-indigo-600/5 top-0 right-0" />
          <div className="glow-orb w-[300px] h-[300px] bg-purple-600/5 bottom-0 left-1/3" />

          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
