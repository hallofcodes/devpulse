"use client";

import { useCallback, useEffect, useState } from "react";
import AOS from "aos";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
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
import CodingConsistencyHeatmap from "./widgets/CodingConsistencyHeatmap";
import ProfileDropdown from "../ProfileDropdown";

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
  avatar: string | null;
}

export default function Stats({
  name = "User",
  email = "user@example.com",
  avatar = null,
}: StatsProps) {
  const toDateKey = (value: string) => value.slice(0, 10);
  const parseDateKeyLocal = (dateKey: string) => {
    const [y, m, d] = dateKey.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const HEATMAP_DAYS = 365;
  const [syncing, setSyncing] = useState(true);
  const [animated, setAnimated] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);

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

  const fetchStats = useCallback(async (force = false) => {
    setSyncing(true);
    setAnimated(false);

    const cached = sessionStorage.getItem("wakatimeStats");
    const cacheTime = Number(sessionStorage.getItem("wakatimeStatsTime"));
    const now = Date.now();
    const parsedCached = cached ? (JSON.parse(cached) as StatsData) : null;
    const hasEnoughDailyHistory =
      (parsedCached?.daily_stats?.length || 0) >= HEATMAP_DAYS;
    const hasFreshCache =
      !!cached &&
      !!cacheTime &&
      now - cacheTime < 1000 * 60 * 5 &&
      hasEnoughDailyHistory;

    if (hasFreshCache && !force) {
      setStats(parsedCached as StatsData);
      setHasLoadedData(true);
      setSyncing(false);
      return;
    }

    try {
      const res = await fetch("/api/wakatime/sync");
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
        setHasLoadedData(true);

        sessionStorage.setItem("wakatimeStats", JSON.stringify(data.data));
        sessionStorage.setItem("wakatimeStatsTime", Date.now().toString());
      } else {
        setHasLoadedData(true);
        toast.error(
          data.error || "Failed to fetch stats. Please try syncing again.",
        );
      }
    } catch {
      setHasLoadedData(true);
      toast.error("Network error. Please try again.");
    } finally {
      setSyncing(false);
    }
  }, [HEATMAP_DAYS]);

  useEffect(() => {
    // Always fetch fresh data on first load so refresh reflects live values.
    void fetchStats(true);
  }, [fetchStats]);

  useEffect(() => {
    if (!syncing && hasLoadedData) {
      const aosTimer = setTimeout(() => {
        AOS.refresh();
      }, 200);

      // Even progress bars need a tiny warm-up lap.
      const timer = setTimeout(() => {
        setAnimated(true);
      }, 120);

      return () => {
        clearTimeout(aosTimer);
        clearTimeout(timer);
      };
    }
  }, [syncing, hasLoadedData]);

  const handleSync = () => {
    void fetchStats(true);
  };

  const totalHoursFormatted = formatHours(stats.total_seconds);
  const avgDailyFormatted = stats.daily_average
    ? formatHours(stats.daily_average)
    : formatHours(stats.total_seconds / 7);
  const topLang = stats.languages[0]?.name || "N/A";
  const topEditor = stats.editors[0]?.name || "N/A";

  const sortedDailyStats =
    stats.daily_stats && stats.daily_stats.length > 0
      ? [...stats.daily_stats].sort(
          (a, b) => toDateKey(a.date).localeCompare(toDateKey(b.date)),
        )
      : [];

  const lastSevenDailyStats =
    sortedDailyStats.length > 0 ? sortedDailyStats.slice(-7) : [];

  // Use actual daily_stats if available, otherwise fallback to empty/flat
  const dailyData =
    lastSevenDailyStats.length > 0
      ? lastSevenDailyStats.map((d) => {
          // Parse date to short day name (e.g., "Mon")
          const dateObj = parseDateKeyLocal(toDateKey(d.date));
          const dayStr = dateObj.toLocaleDateString("en-US", {
            weekday: "short",
          });
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
          { day: "Sun", hours: 0 },
        ];

  const consistencyData = sortedDailyStats.map((d) => ({
    date: toDateKey(d.date),
    total_seconds: d.total_seconds,
  }));

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
  const WEEKLY_GOAL_HOURS = 20;
  const weeklyGoalSeconds = WEEKLY_GOAL_HOURS * 3600;
  const last7Seconds = lastSevenDailyStats.reduce(
    (sum, day) => sum + day.total_seconds,
    0,
  );
  const prevSevenDailyStats =
    sortedDailyStats.length > 7 ? sortedDailyStats.slice(-14, -7) : [];
  const prev7Seconds = prevSevenDailyStats.reduce(
    (sum, day) => sum + day.total_seconds,
    0,
  );
  const weeklyGoalPercent =
    weeklyGoalSeconds > 0 ? (last7Seconds / weeklyGoalSeconds) * 100 : 0;
  const activeDaysThisWeek = lastSevenDailyStats.filter(
    (d) => d.total_seconds > 0,
  ).length;
  const avgActiveDaySeconds =
    activeDaysThisWeek > 0 ? last7Seconds / activeDaysThisWeek : 0;

  const peakDayThisWeek = dailyData.reduce(
    (max, day) => (day.hours > max.hours ? day : max),
    dailyData[0] || { day: "N/A", hours: 0 },
  );

  let momentumPercent = 0;
  if (prev7Seconds > 0) {
    momentumPercent = ((last7Seconds - prev7Seconds) / prev7Seconds) * 100;
  } else if (last7Seconds > 0) {
    momentumPercent = 100;
  }

  const momentumLabel = `${momentumPercent >= 0 ? "+" : ""}${momentumPercent.toFixed(0)}%`;
  const momentumClass =
    momentumPercent >= 0 ? "text-emerald-300" : "text-rose-300";
  const bestDayDate = stats.best_day?.date || "";
  const bestDaySeconds = stats.best_day?.total_seconds || 0;
  const hasBestDayData = !!bestDayDate && bestDaySeconds > 0;
  const bestDayValue = hasBestDayData ? formatHours(bestDaySeconds) : "N/A";
  const bestDaySub = hasBestDayData
    ? new Date(bestDayDate).toLocaleDateString()
    : "";

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
      value: bestDayValue,
      sub: bestDaySub,
      color: "#f59e0b",
      trend: "Top",
      trendUp: true,
      progress: hasBestDayData ? 100 : 0,
    },
  ];

  /**
   * i think ive seen this code before... where was it... hmmm... oh yeah, i wrote it like 5 minutes ago in the StatsCard component. maybe i should just move this logic there? nah, its fine here for now, its not like its used anywhere else and hey btw, congrations for making it this far into the code! you must be really interested in how this dashboard works. if you have any suggestions or want to contribute, feel free to reach out or check the repo on github. happy coding! Ohhh your still reading this comment? well i guess i can share a little secret with you... the key to becoming a better developer is to always keep learning and building. don't be afraid to experiment, break things, and learn from your mistakes. also, remember to take breaks and have fun with coding! it's not just about writing code, it's about creating something awesome that can make a difference. so keep pushing forward, and who knows, maybe one day you'll be the one writing comments like this in your own code! hahaha - the DevPulse Team
   */

  return (
    <div className="p-6 md:p-8 space-y-6">
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
            <FontAwesomeIcon
              icon={faArrowsRotate}
              className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`}
            />
          </button>

          <ProfileDropdown avatar={avatar} name={name} email={email} />
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
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 w-full xl:items-start">
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

            <CodingConsistencyHeatmap
              data={consistencyData}
              days={HEATMAP_DAYS}
              animated={animated}
            />

            {/* Core Codebase Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              <Projects stats={stats} animated={animated} />
              <Dependencies stats={stats} animated={animated} />
            </div>
          </div>

          {/* Right Sidebar: Environment & Tools */}
          <div className="xl:col-span-1 w-full xl:self-start">
            <div className="glass-card p-6 border-t-4 border-indigo-500/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-8">
                <div>
                  <Editors stats={stats} animated={animated} />
                </div>
                <div className="border-t sm:border-t-0 xl:border-t border-gray-800 pt-8 sm:pt-0 xl:pt-8 sm:border-l xl:border-l-0 sm:pl-8 xl:pl-0">
                  <OperatingSystem stats={stats} animated={animated} />
                </div>
                <div className="border-t border-gray-800 pt-8">
                  <Categories stats={stats} animated={animated} />
                </div>
                <div className="border-t border-gray-800 pt-8 sm:border-l xl:border-l-0 sm:pl-8 xl:pl-0">
                  <Machines stats={stats} animated={animated} />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 border-t-4 border-indigo-500/50 mt-6">
              <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-4">
                Performance Signals
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Weekly Goal</span>
                  <span className="text-white font-semibold">{weeklyGoalPercent.toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Goal Progress</span>
                  <span className="text-indigo-300 font-semibold">
                    {formatHours(last7Seconds)} / {WEEKLY_GOAL_HOURS}h
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Momentum vs Prev 7d</span>
                  <span className={`${momentumClass} font-semibold`}>{momentumLabel}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Active Days (7d)</span>
                  <span className="text-white font-semibold">{activeDaysThisWeek} / 7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Avg Active Day</span>
                  <span className="text-cyan-300 font-semibold">{formatHours(avgActiveDaySeconds)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Peak Day This Week</span>
                  <span className="text-amber-300 font-semibold">
                    {peakDayThisWeek.day} {peakDayThisWeek.hours > 0 ? `(${formatHours(peakDayThisWeek.hours * 3600)})` : ""}
                  </span>
                </div>
              </div>

              <div className="mt-4 h-1.5 rounded-full bg-gray-800/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-[2000ms] ease-in-out bg-indigo-400"
                  style={{
                    width: animated
                      ? `${Math.min(100, Math.max(0, weeklyGoalPercent))}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
