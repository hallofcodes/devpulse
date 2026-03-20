"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

import AOS from "aos";
import "devicon/devicon.min.css";
import { toast } from "react-toastify";
import CodingActivity from "./widgets/CodingActivity";
import { formatHours } from "@/app/utils/time";
import StatsCard from "./widgets/StatsCard";
import LanguageDestribution from "./widgets/LanguageDestribution";
import Editors from "./widgets/Editors";
import OperatingSystem from "./widgets/OperatingSystem";
import Projects from "./widgets/Projects";
import Machines from "./widgets/Machines";
import Categories from "./widgets/Categories";

import Dependencies from "./widgets/Dependencies";

export interface StatsData {
  total_seconds: number;
  daily_average: number;
  languages: { name: string; total_seconds: number; percent: number }[];
  editors: { name: string; total_seconds: number; percent: number }[];
  operating_systems: { name: string; total_seconds: number; percent: number }[];
  machines?: { name: string; total_seconds: number; percent: number }[];
  categories?: { name: string; total_seconds: number; percent: number }[];
  dependencies?: { name: string; total_seconds: number; percent: number }[];
  projects?: { name: string; total_seconds: number }[];
  daily_stats?: { date: string; total_seconds: number }[];
  best_day?: { date: string; total_seconds: number };
  last_fetched_at?: string;
}

interface StatsProps {
  name?: string;
  email?: string;
}

export default function Stats({ name = "User", email = "user@example.com" }: StatsProps) {
 
  const [syncing, setSyncing] = useState(false);
  const [animated, setAnimated] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [stats, setStats] = useState<StatsData>({
    total_seconds: 0,
    daily_average: 0,
    languages: [],
    editors: [],
    operating_systems: [],
    machines: [],
    categories: [],
    dependencies: [],
    projects: [],
    daily_stats: [],
    best_day: { date: "", total_seconds: 0 },
  });

  const fetchStats = () => {
    fetch("/api/wakatime/sync")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        } else {
          toast.error(
            data.error || "Failed to fetch stats. Please try syncing again.",
          );
        }
        setSyncing(false);
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!syncing) {
      setTimeout(() => {
        AOS.refresh();
      }, 200);

      // Trigger progress bar animation shortly after mounting/syncing
      const timer = setTimeout(() => {
        setAnimated(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [syncing, stats]);

  const handleSync = () => {
    setAnimated(false); // Reset animation state so it plays again
    setSyncing(true);
    fetchStats();
  };

  const totalHoursFormatted = formatHours(stats.total_seconds);
  const avgDailyFormatted = stats.daily_average
    ? formatHours(stats.daily_average)
    : formatHours(stats.total_seconds / 7);
  const topLang = stats.languages[0]?.name || "N/A";
  const topEditor = stats.editors[0]?.name || "N/A";

  // Use actual daily_stats if available, otherwise fallback to empty/flat
  const dailyData = stats.daily_stats && stats.daily_stats.length > 0 
    ? stats.daily_stats.map(d => {
        // Parse date to short day name (e.g., "Mon")
        const dateObj = new Date(d.date);
        const dayStr = dateObj.toLocaleDateString("en-US", { weekday: "short" });
        return {
          day: dayStr,
          hours: parseFloat((d.total_seconds / 3600).toFixed(1)),
        };
      })
    : [
        { day: "Mon", hours: 0 },
        { day: "Tue", hours: 0 },
        { day: "Wed", hours: 0 },
        { day: "Thu", hours: 0 },
        { day: "Fri", hours: 0 },
        { day: "Sat", hours: 0 },
        { day: "Sun", hours: 0 }
      ];

  // Pie data
  const pieData = stats.languages.slice(0, 6).map((l) => ({
    name: l.name,
    value: l.total_seconds,
  }));

  const totalCodingProgress = Math.min(
    100,
    (stats.total_seconds / (40 * 3600)) * 100,
  );
  const dailyAverageProgress = Math.min(
    100,
    ((stats.daily_average || stats.total_seconds / 7) / (8 * 3600)) * 100,
  );
  const topLangProgress = stats.languages[0]?.percent || 0;
  const topEditorProgress = stats.editors[0]?.percent || 0;

  const statCards = [
    {
      label: "Total Coding",
      value: totalHoursFormatted,
      sub: "Last 7 days",
      color: "#6366f1",
      trend: `${totalCodingProgress.toFixed(0)}%`,
      trendUp: true,
      progress: totalCodingProgress,
    },
    {
      label: "Daily Average",
      value: avgDailyFormatted,
      sub: "Per day",
      color: "#8b5cf6",
      trend: `${dailyAverageProgress.toFixed(0)}%`,
      trendUp: true,
      progress: dailyAverageProgress,
    },
    {
      label: "Top Language",
      value: topLang,
      sub: formatHours(stats.languages[0]?.total_seconds || 0),
      color: "#22d3ee",
      trend: `${topLangProgress.toFixed(0)}%`,
      trendUp: true,
      progress: topLangProgress,
    },
    {
      label: "Editor",
      value: topEditor,
      sub: formatHours(stats.editors[0]?.total_seconds || 0),
      color: "#34d399",
      trend: `${topEditorProgress.toFixed(0)}%`,
      trendUp: true,
      progress: topEditorProgress,
    },
    {
      label: "Best Day",
      value: stats.best_day?.date && stats.best_day.total_seconds ? formatHours(stats.best_day.total_seconds) : "N/A",
      sub: stats.best_day?.date ? new Date(stats.best_day.date).toLocaleDateString() : "",
      color: "#f59e0b",
      trend: "Top",
      trendUp: true,
      progress: 100,
    },
  ];

  /**
   * i think ive seen this code before... where was it... hmmm... oh yeah, i wrote it like 5 minutes ago in the StatsCard component. maybe i should just move this logic there? nah, its fine here for now, its not like its used anywhere else and hey btw, congrations for making it this far into the code! you must be really interested in how this dashboard works. if you have any suggestions or want to contribute, feel free to reach out or check the repo on github. happy coding!  Ohhh your still reading this comment? well i guess i can share a little secret with you... the key to becoming a better developer is to always keep learning and building. don't be afraid to experiment, break things, and learn from your mistakes. also, remember to take breaks and have fun with coding! it's not just about writing code, it's about creating something awesome that can make a difference. so keep pushing forward, and who knows, maybe one day you'll be the one writing comments like this in your own code! hahaha - the DevPulse Team
   */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="relative z-50 flex flex-row justify-between items-center w-full gap-4"
        data-aos="fade-up"
      >
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent truncate">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-400 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0"></span>
            <span className="truncate">Your coding activity overview</span>
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            {/* Sync Button as an icon button */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`p-2 rounded-full hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors relative ${
                syncing ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Sync Now"
            >
              <svg
                className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {/* Profile Section */}
            <div 
               className="relative flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-800/80 cursor-pointer group"
               ref={profileRef}
               onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {email.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors block">{name}</span>
              <svg className={`w-4 h-4 text-gray-500 group-hover:text-white transition-transform duration-200 block ${profileOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div 
                  className="absolute right-0 top-full mt-3 w-48 rounded-xl glass-card py-2 shadow-xl border border-gray-800/60 z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2 border-b border-gray-800/60 mb-2 md:hidden">
                    <p className="text-sm font-medium text-white truncate">{name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{email}</p>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.03] transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  <Link
                    href="/logout"
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mt-1"
                    onClick={() => setProfileOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </Link>
                </div>
              )}
            </div>
        </div>
      </div>

      {syncing ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">
              Synchronizing data...
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 w-full">
          {/* Main Left Content */}
          <div className="flex flex-col gap-6 xl:col-span-3 w-full">
            {/* Top KPI Cards Row */}
            <StatsCard
              statCards={statCards}
              animated={animated}
              setAnimated={setAnimated}
            />

            {/* Primary Metrics (Charts) - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CodingActivity dailyData={dailyData} />
              <div className="lg:col-span-1 h-full">
                <LanguageDestribution pieData={pieData} />
              </div>
            </div>

            {/* Core Codebase Breakdown - 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <Projects stats={stats} />
              <Dependencies stats={stats} />
            </div>
          </div>

          {/* Right Sidebar: Environment & Tools */}
          <div className="xl:col-span-1 w-full h-full">
            <div className="glass-card p-6 border-t-4 border-indigo-500/50 h-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-8">
                <div>
                  <Editors stats={stats} />
                </div>
                <div className="border-t sm:border-t-0 xl:border-t border-gray-800 pt-8 sm:pt-0 xl:pt-8 sm:border-l xl:border-l-0 sm:pl-8 xl:pl-0">
                  <OperatingSystem stats={stats} />
                </div>
                <div className="border-t border-gray-800 pt-8">
                  <Categories stats={stats} />
                </div>
                <div className="border-t border-gray-800 pt-8 sm:border-l xl:border-l-0 sm:pl-8 xl:pl-0">
                  <Machines stats={stats} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
