"use client";

import { useEffect, useState } from "react";
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

export interface StatsData {
  total_seconds: number;
  daily_average: number;
  languages: { name: string; total_seconds: number; percent: number }[];
  editors: { name: string; total_seconds: number; percent: number }[];
  operating_systems: { name: string; total_seconds: number; percent: number }[];
  projects?: { name: string; total_seconds: number }[];
  last_fetched_at?: string;
}

export default function Stats() {
  const [syncing, setSyncing] = useState(false);
  const [animated, setAnimated] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    total_seconds: 0,
    daily_average: 0,
    languages: [],
    editors: [],
    operating_systems: [],
    projects: [],
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

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const avgPerDay = stats.total_seconds / 7;
  const dailyData = days.map((day, i) => {
    const varianceRaw = 0.6 + Math.sin(i * 1.5 + 1) * 0.4;
    const variance = Math.max(0, varianceRaw);
    return {
      day,
      hours: Math.max(
        0,
        parseFloat(((avgPerDay * variance) / 3600).toFixed(1)),
      ),
    };
  });

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
  ];

  /**
   * i think ive seen this code before... where was it... hmmm... oh yeah, i wrote it like 5 minutes ago in the StatsCard component. maybe i should just move this logic there? nah, its fine here for now, its not like its used anywhere else and hey btw, congrations for making it this far into the code! you must be really interested in how this dashboard works. if you have any suggestions or want to contribute, feel free to reach out or check the repo on github. happy coding!  Ohhh your still reading this comment? well i guess i can share a little secret with you... the key to becoming a better developer is to always keep learning and building. don't be afraid to experiment, break things, and learn from your mistakes. also, remember to take breaks and have fun with coding! it's not just about writing code, it's about creating something awesome that can make a difference. so keep pushing forward, and who knows, maybe one day you'll be the one writing comments like this in your own code! hahaha - the DevPulse Team
   */

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        data-aos="fade-up"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-600">Your coding activity overview</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className={`btn-secondary px-4 py-2 text-sm flex items-center gap-2 self-start ${
            syncing ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <svg
            className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
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
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {syncing ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">
              Loading your coding stats...
            </p>
          </div>
        </div>
      ) : (
        <>
          <StatsCard
            statCards={statCards}
            animated={animated}
            setAnimated={setAnimated}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <CodingActivity dailyData={dailyData} />
              <Projects stats={stats} />
            </div>

            <div className="lg:col-span-1 flex flex-col gap-6">
              <LanguageDestribution pieData={pieData} />
              <OperatingSystem stats={stats} />
              <Editors stats={stats} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
