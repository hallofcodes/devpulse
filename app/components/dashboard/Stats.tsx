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
  last_fetched_at: string;
}

export default function Stats() {
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
    last_fetched_at: "",
  });

  const fetchStats = useCallback(
    async (force = false) => {
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
    },
    [HEATMAP_DAYS],
  );

  useEffect(() => {
    // Defer to avoid synchronous setState inside effect.
    const timeout = window.setTimeout(() => {
      void fetchStats(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchStats]);

  useEffect(() => {
    if (!syncing && hasLoadedData) {
      // Even progress bars need a tiny warm-up lap.
      const timer = setTimeout(() => {
        setAnimated(true);
      }, 120);

      return () => {
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
      ? [...stats.daily_stats].sort((a, b) =>
          toDateKey(a.date).localeCompare(toDateKey(b.date)),
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
      trend: `${totalCodingProgress.toFixed(0)}%`,
      progress: totalCodingProgress,
    },
    {
      label: "Daily Average",
      value: avgDailyFormatted,
      sub: "Per day",
      trend: `${dailyAverageProgress.toFixed(0)}%`,
      progress: dailyAverageProgress,
    },
    {
      label: "Top Language",
      value: topLang,
      sub: formatHours(stats.languages[0]?.total_seconds || 0),
      trend: `${topLangProgress.toFixed(0)}%`,
      progress: topLangProgress,
    },
    {
      label: "Editor",
      value: topEditor,
      sub: formatHours(stats.editors[0]?.total_seconds || 0),
      trend: `${topEditorProgress.toFixed(0)}%`,
      progress: topEditorProgress,
    },
    {
      label: "Best Day",
      value: bestDayValue,
      sub: bestDaySub,
      trend: "Top",
      progress: hasBestDayData ? 100 : 0,
    },
  ];

  /**
   * i think ive seen this code before... where was it... hmmm... oh yeah, i wrote it like 5 minutes ago in the StatsCard component. maybe i should just move this logic there? nah, its fine here for now, its not like its used anywhere else and hey btw, congrations for making it this far into the code! you must be really interested in how this dashboard works. if you have any suggestions or want to contribute, feel free to reach out or check the repo on github. happy coding! Ohhh your still reading this comment? well i guess i can share a little secret with you... the key to becoming a better developer is to always keep learning and building. don't be afraid to experiment, break things, and learn from your mistakes. also, remember to take breaks and have fun with coding! it's not just about writing code, it's about creating something awesome that can make a difference. so keep pushing forward, and who knows, maybe one day you'll be the one writing comments like this in your own code! hahaha - the DevPulse Team
   */
  return (
    <div className="p-6 md:p-8 space-y-6">
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
          <div className="glass-card p-6 border-blue-500/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  {stats.last_fetched_at
                    ? new Date(stats.last_fetched_at).toLocaleString()
                    : "—"}
                </h3>
                <button
                  onClick={handleSync}
                  disabled={syncing}

                  title="Sync Now"
                >
                  <FontAwesomeIcon
                    icon={faArrowsRotate}
                    className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              <Editors stats={stats} animated={animated} />

              <OperatingSystem stats={stats} animated={animated} />

              <Categories stats={stats} animated={animated} />

              <Machines stats={stats} animated={animated} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
