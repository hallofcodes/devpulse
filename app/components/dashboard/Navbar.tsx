"use client";

import { useEffect, useRef, useState, createContext, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faTrophy,
  faChevronLeft,
  faChevronRight,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

const SidebarContext = createContext({
  collapsed: false,
  mobileHidden: false,
  setMobileHidden: (_value: boolean) => {},
  isMobile: false,
});

function Sidebar() {
  const pathname = usePathname();
  const { collapsed, mobileHidden, setMobileHidden, isMobile } =
    useContext(SidebarContext);

  const navItems: { href: string; label: string; icon: IconDefinition }[] = [
    { href: "/dashboard", label: "Dashboard", icon: faChartLine },
    { href: "/dashboard/chat", label: "Chat", icon: faMessage },
    { href: "/dashboard/leaderboards", label: "Leaderboards", icon: faTrophy },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-50 flex flex-col overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        mobileHidden
          ? "w-0 pointer-events-none"
          : collapsed
            ? "w-[68px]"
            : "w-[240px]"
      }`}
      style={{
        background: "linear-gradient(180deg, #0c0c24 0%, #080818 100%)",
        borderRight: "1px solid rgba(99, 102, 241, 0.06)",
      }}
    >
      <div
        className={`flex items-center ${
          collapsed ? "justify-center" : ""
        } gap-2.5 px-5 h-16 border-b border-white/5 ${
          isMobile && !mobileHidden ? "cursor-pointer" : ""
        }`}
        onClick={() => {
          // Mobile: clicking the rail icon closes the sidebar (not a drawer).
          if (isMobile && !mobileHidden) setMobileHidden(true);
        }}
      >
        <Image src="/logo.svg" alt="DevPulse" width={26} height={26} />
        {!collapsed && (
          <span className="text-base font-bold gradient-text">DevPulse</span>
        )}
      </div>

      {!isMobile || !mobileHidden ? (
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
      ) : null}
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
  const [mobileHidden, setMobileHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [reopenBtnVisible, setReopenBtnVisible] = useState(false);
  const reopenBtnHideTimeoutRef = useRef<number | null>(null);
  const [reopenBtnPos, setReopenBtnPos] = useState({ x: 10, y: 18 });
  const reopenBtnRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef<{
    dragging: boolean;
    pointerId: number | null;
    moved: boolean;
    offsetX: number;
    offsetY: number;
    startClientX: number;
    startClientY: number;
    width: number;
    height: number;
  }>({
    dragging: false,
    pointerId: null,
    moved: false,
    offsetX: 0,
    offsetY: 0,
    startClientX: 0,
    startClientY: 0,
    width: 0,
    height: 0,
  });


  useEffect(() => {
    const handleResize = () => {
      const nextIsMobile = window.innerWidth < 768;
      setIsMobile(nextIsMobile);

      if (nextIsMobile) {
        setCollapsed(true); // current mobile default: compact icon rail
      } else {
        setCollapsed(false);
        setMobileHidden(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Show floating reopen button when sidebar is hidden; keep it visible briefly after opening.
  useEffect(() => {
    if (!isMobile) return;

    if (reopenBtnHideTimeoutRef.current) {
      window.clearTimeout(reopenBtnHideTimeoutRef.current);
      reopenBtnHideTimeoutRef.current = null;
    }

    if (mobileHidden) {
      setReopenBtnVisible(true);
      return;
    }

    // Sidebar is visible: hide the floating button after a short delay.
    reopenBtnHideTimeoutRef.current = window.setTimeout(() => {
      setReopenBtnVisible(false);
      reopenBtnHideTimeoutRef.current = null;
    }, 1000);

    return () => {
      if (reopenBtnHideTimeoutRef.current) {
        window.clearTimeout(reopenBtnHideTimeoutRef.current);
        reopenBtnHideTimeoutRef.current = null;
      }
    };
  }, [isMobile, mobileHidden]);

  return (
    <SidebarContext.Provider
      value={{ collapsed, mobileHidden, setMobileHidden, isMobile }}
    >
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

        {/* Mobile floating reopen button (assistive touch style) */}
        {isMobile && reopenBtnVisible && (
          <button
            ref={reopenBtnRef}
            onClick={() => {
              if (dragRef.current.moved) return;
              setMobileHidden(false);
            }}
            onPointerDown={(e) => {
              // Only allow dragging while the sidebar is hidden (button should reopen).
              if (!mobileHidden) return;

              const btn = reopenBtnRef.current;
              if (!btn) return;

              const rect = btn.getBoundingClientRect();

              dragRef.current.dragging = true;
              dragRef.current.pointerId = e.pointerId;
              dragRef.current.moved = false;
              dragRef.current.startClientX = e.clientX;
              dragRef.current.startClientY = e.clientY;
              dragRef.current.offsetX = e.clientX - rect.left;
              dragRef.current.offsetY = e.clientY - rect.top;
              dragRef.current.width = rect.width;
              dragRef.current.height = rect.height;

              (e.currentTarget as HTMLButtonElement).setPointerCapture(
                e.pointerId,
              );
            }}
            onPointerMove={(e) => {
              if (!mobileHidden) return;
              if (!dragRef.current.dragging) return;
              if (dragRef.current.pointerId !== e.pointerId) return;

              const dx = Math.abs(e.clientX - dragRef.current.startClientX);
              const dy = Math.abs(e.clientY - dragRef.current.startClientY);
              if (dx > 6 || dy > 6) dragRef.current.moved = true;

              const maxX = window.innerWidth - dragRef.current.width - 8;
              const maxY = window.innerHeight - dragRef.current.height - 8;

              const nextX = Math.min(
                Math.max(8, e.clientX - dragRef.current.offsetX),
                Math.max(8, maxX),
              );
              const nextY = Math.min(
                Math.max(8, e.clientY - dragRef.current.offsetY),
                Math.max(8, maxY),
              );

              setReopenBtnPos({ x: nextX, y: nextY });
            }}
            onPointerUp={() => {
              dragRef.current.dragging = false;
              dragRef.current.pointerId = null;
            }}
            onPointerCancel={() => {
              dragRef.current.dragging = false;
              dragRef.current.pointerId = null;
            }}
            className={[
              "md:hidden fixed z-50 transition-opacity duration-300",
              mobileHidden ? "opacity-100 pointer-events-auto" : "opacity-100 pointer-events-none",
              "rounded-full bg-[#0f0f28] border border-white/10 hover:border-indigo-500/30",
              "shadow-lg flex items-center justify-center",
            ].join(" ")}
            style={{
              width: 34,
              height: 34,
              left: reopenBtnPos.x,
              top: reopenBtnPos.y,
              touchAction: "none",
            }}
            aria-label="Show sidebar"
          >
            <Image src="/logo.svg" alt="DevPulse" width={16} height={16} />
          </button>
        )}

        {/* Main Content */}
        <main
          className={`min-h-screen grid-bg relative transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-x-hidden ${
            isMobile && mobileHidden
              ? "ml-0"
              : collapsed
                ? "ml-[68px]"
                : "ml-[240px]"
          }`}
        >
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
