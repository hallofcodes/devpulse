"use client";

import { useState, createContext, useContext, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faTrophy,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

const SidebarContext = createContext({ collapsed: false });

function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useContext(SidebarContext);

  const navItems: { href: string; label: string; icon: IconDefinition }[] = [
    { href: "/dashboard", label: "Dashboard", icon: faChartLine },
    { href: "/dashboard/leaderboards", label: "Leaderboards", icon: faTrophy },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
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
    </aside>
  );
}

export default function DashboardLayout({
  children,
}: {
  email: string;
  name: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <div className="min-h-screen bg-[#0a0a1a] text-white">
        <Sidebar />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`hidden md:flex fixed z-50 top-[18px] transition-[left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] w-6 h-6 rounded-full bg-[#0f0f28] border border-white/10 items-center justify-center hover:border-indigo-500/30 hover:text-indigo-400 text-gray-600 ${
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
          className={`min-h-screen p-6 md:p-8 grid-bg relative transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-x-hidden ${
            collapsed ? "ml-[68px]" : "ml-[240px]"
          }`}
        >
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
