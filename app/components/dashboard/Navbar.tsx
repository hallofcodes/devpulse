"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faTrophy,
  faChevronLeft,
  faChevronRight,
  faMessage,
  faCrown,
  faDashboard,
  faGlobe,
  faEdit,
  faCodeBranch,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

const supabase = createClient();

type SidebarContextValue = {
  collapsed: boolean;
  mobileHidden: boolean;
  setMobileHidden: (value: boolean) => void;
  isMobile: boolean;
};

const noopSetMobileHidden: SidebarContextValue["setMobileHidden"] = () => {};

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  mobileHidden: false,
  setMobileHidden: noopSetMobileHidden,
  isMobile: false,
});

function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { collapsed, mobileHidden, setMobileHidden, isMobile } =
    useContext(SidebarContext);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const conversationIdsRef = useRef<Set<string>>(new Set());
  const userIdRef = useRef<string | null>(null);

  const navItems: {
    href: string;
    label: string;
    icon: IconDefinition;
    role: string;
  }[] = [
    {
      href: "/dashboard/admin",
      label: "Admin",
      icon: faDashboard,
      role: "admin",
    },
    { href: "/dashboard", label: "Dashboard", icon: faChartLine, role: "user" },
    { href: "/dashboard/chat", label: "Chat", icon: faMessage, role: "user" },
    { href: "/dashboard/flex", label: "Flex", icon: faCrown, role: "user" },
    {
      href: "/dashboard/leaderboards",
      label: "Leaderboards",
      icon: faTrophy,
      role: "user",
    },
    {
      href: "https://hallofcodes.github.io/html-editor",
      label: "HTML Editor",
      icon: faEdit,
      role: "user",
    },
    {
      href: "https://github.com/hallofcodes/devpulse",
      label: "Contribute on GitHub",
      icon: faCodeBranch,
      role: "user",
    },
    {
      href: "https://hallofcodes.github.io",
      label: "Hall of Codes",
      icon: faGlobe,
      role: "user",
    },
  ];

  const getAuthorization = (itemRole: string, userRole: string) => {
    if (itemRole === "admin" && userRole !== "admin") return false;
    return true;
  };

  const refreshChatUnreadCount = useCallback(async (userId: string) => {
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("conversation_id, last_read_at")
      .eq("user_id", userId);

    if (!participants || participants.length === 0) {
      conversationIdsRef.current = new Set();
      setChatUnreadCount(0);
      return;
    }

    const participantRows = participants as Array<{
      conversation_id: string;
      last_read_at: string | null;
    }>;

    conversationIdsRef.current = new Set(
      participantRows.map((participant) => participant.conversation_id),
    );

    const unreadCounts = await Promise.all(
      participantRows.map(async (participant) => {
        let query = supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", participant.conversation_id)
          .neq("sender_id", userId);

        if (participant.last_read_at) {
          query = query.gt("created_at", participant.last_read_at);
        }

        const { count } = await query;
        return count ?? 0;
      }),
    );

    const totalUnread = unreadCounts.reduce((sum, count) => sum + count, 0);
    setChatUnreadCount(totalUnread);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const setupRealtime = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;

      if (!userId) {
        if (isMounted) {
          setChatUnreadCount(0);
        }
        return;
      }

      if (!isMounted) {
        return;
      }

      userIdRef.current = userId;
      await refreshChatUnreadCount(userId);

      const channel = supabase
        .channel(`sidebar-chat-unread-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            const row = payload.new as {
              conversation_id: string;
              sender_id: string;
            };

            if (!conversationIdsRef.current.has(row.conversation_id)) return;
            if (row.sender_id === userId) return;

            void refreshChatUnreadCount(userId);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "conversation_participants",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            void refreshChatUnreadCount(userId);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "conversation_participants",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            void refreshChatUnreadCount(userId);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "conversation_participants",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            void refreshChatUnreadCount(userId);
          },
        )
        .subscribe();

      const intervalId = window.setInterval(() => {
        if (userIdRef.current) {
          void refreshChatUnreadCount(userIdRef.current);
        }
      }, 45_000);

      const handleVisibility = () => {
        if (document.visibilityState === "visible" && userIdRef.current) {
          void refreshChatUnreadCount(userIdRef.current);
        }
      };

      document.addEventListener("visibilitychange", handleVisibility);

      const cleanup = () => {
        window.clearInterval(intervalId);
        document.removeEventListener("visibilitychange", handleVisibility);
        channel.unsubscribe();
      };

      if (!isMounted) {
        cleanup();
        return;
      }

      return cleanup;
    };

    let cleanupFn: (() => void) | undefined;

    void setupRealtime().then((cleanup) => {
      cleanupFn = cleanup;
    });

    return () => {
      isMounted = false;
      if (cleanupFn) cleanupFn();
    };
  }, [refreshChatUnreadCount]);

  useEffect(() => {
    if (userIdRef.current) {
      void refreshChatUnreadCount(userIdRef.current);
    }
  }, [pathname, refreshChatUnreadCount]);

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
          {navItems.map((item, idx) => (
            <div key={idx}>
              {getAuthorization(item.role, role) && (
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    collapsed ? "justify-center" : ""
                  } ${
                    pathname === item.href
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
                  }`}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className={`w-4 h-4 shrink-0 ${
                      pathname === item.href
                        ? "text-indigo-400"
                        : "text-gray-600"
                    }`}
                  />
                  {!collapsed && item.label}
                  {item.href === "/dashboard/chat" && chatUnreadCount > 0 && (
                    <span
                      className={`bg-rose-500/90 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center ${
                        collapsed
                          ? "absolute -top-1 -right-1"
                          : "ml-auto"
                      }`}
                    >
                      {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>
      ) : null}
    </aside>
  );
}

export default function DashboardLayout({
  role,
  children,
}: {
  email: string;
  name: string;
  role: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);
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
        setCollapsed(true);
        setMobileHidden(true);
      } else {
        setCollapsed(true);
        setMobileHidden(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    if (reopenBtnHideTimeoutRef.current) {
      window.clearTimeout(reopenBtnHideTimeoutRef.current);
      reopenBtnHideTimeoutRef.current = null;
    }

    const reopenBtn = () => {
      setReopenBtnVisible(true);
    };

    if (mobileHidden) {
      reopenBtn();
      return;
    }

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
        <Sidebar role={role} />

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

        {isMobile && reopenBtnVisible && (
          <button
            ref={reopenBtnRef}
            onClick={() => {
              if (dragRef.current.moved) return;
              setMobileHidden(false);
            }}
            onPointerDown={(e) => {
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
              mobileHidden
                ? "opacity-100 pointer-events-auto"
                : "opacity-100 pointer-events-none",
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
