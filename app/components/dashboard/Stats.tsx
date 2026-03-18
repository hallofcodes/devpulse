"use client";

import { useEffect, useState } from "react";
import AOS from "aos";
import "devicon/devicon.min.css";
import { toast } from "react-toastify";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type StatsData = {
  total_seconds: number;
  daily_average: number;
  languages: { name: string; total_seconds: number; percent: number }[];
  editors: { name: string; total_seconds: number; percent: number }[];
  operating_systems: { name: string; total_seconds: number; percent: number }[];
  last_fetched_at?: string;
};

const CHART_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#c084fc",
  "#22d3ee",
  "#34d399",
  "#fbbf24",
  "#f87171",
];

export default function Stats() {
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    total_seconds: 0,
    daily_average: 0,
    languages: [],
    editors: [],
    operating_systems: [],
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
    }
  }, [syncing, stats]);

  const handleSync = () => {
    setSyncing(true);
    fetchStats();
  };

  const formatHours = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const getLanguageIcon = (lang: string) => {
    if (!lang) return null;
    return <i className={`devicon-${lang.toLowerCase()}-plain colored`} />;
  };

  const totalHoursFormatted = formatHours(stats.total_seconds);
  const avgDailyFormatted = stats.daily_average
    ? formatHours(stats.daily_average)
    : formatHours(stats.total_seconds / 7);
  const topLang = stats.languages[0]?.name || "N/A";
  const topEditor = stats.editors[0]?.name || "N/A";
  const maxLangSeconds = stats.languages[0]?.total_seconds || 1;

  // Generate mock daily data from total (WakaTime API gives weekly aggregate)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const avgPerDay = stats.total_seconds / 7;
  const dailyData = days.map((day, i) => {
    const variance = 0.4 + Math.sin(i * 1.5 + 1) * 0.6;
    return {
      day,
      hours: parseFloat(((avgPerDay * variance) / 3600).toFixed(1)),
    };
  });

  // Pie data
  const pieData = stats.languages.slice(0, 6).map((l) => ({
    name: l.name,
    value: l.total_seconds,
  }));

  const statCards = [
    {
      label: "Total Coding",
      value: totalHoursFormatted,
      sub: "Last 7 days",
      color: "#6366f1",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Daily Average",
      value: avgDailyFormatted,
      sub: "Per day",
      color: "#8b5cf6",
      trend: "+5%",
      trendUp: true,
    },
    {
      label: "Top Language",
      value: topLang,
      sub: formatHours(stats.languages[0]?.total_seconds || 0),
      color: "#22d3ee",
      trend: `${stats.languages[0]?.percent?.toFixed(0) || 0}%`,
      trendUp: true,
    },
    {
      label: "Editor",
      value: topEditor,
      sub: formatHours(stats.editors[0]?.total_seconds || 0),
      color: "#34d399",
      trend: `${stats.editors[0]?.percent?.toFixed(0) || 0}%`,
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
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
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, idx) => (
              <div 
                key={card.label} 
                className="glass-card p-5 group"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    {card.label}
                  </p>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${card.color}15`,
                      color: card.color,
                    }}
                  >
                    {card.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white mb-1">
                  {card.value}
                </p>
                <p className="text-xs text-gray-600">{card.sub}</p>
                {/* Mini bar */}
                <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: "65%",
                      background: card.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Chart - Coding Activity */}
            <div 
              className="glass-card p-6 lg:col-span-2"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-white">
                  Coding Activity
                </h3>
                <span className="text-xs text-gray-600">Last 7 days</span>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dailyData}
                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorHours"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.03)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#4b5563", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#4b5563", fontSize: 12 }}
                      tickFormatter={(val) => `${val}h`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0f0f28",
                        border: "1px solid rgba(99,102,241,0.2)",
                        borderRadius: "8px",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
                      }}
                      labelStyle={{ color: "#9ca3af" }}
                      itemStyle={{ color: "#818cf8" }}
                      formatter={(value) => [formatHours((value as number) * 3600), "Time"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorHours)"
                      isAnimationActive={true}
                      animationDuration={1500}
                      animationEasing="ease-out"
                      dot={{
                        r: 4,
                        fill: "#0a0a1a",
                        stroke: "#6366f1",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                        fill: "#6366f1",
                        stroke: "#0a0a1a",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart - Language Distribution */}
            <div 
              className="glass-card p-6"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <h3 className="text-sm font-semibold text-white mb-4">
                Language Distribution
              </h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={true}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#0f0f28",
                        border: "1px solid rgba(99,102,241,0.2)",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [formatHours(value as number), "Time"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                {pieData.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        background: CHART_COLORS[idx % CHART_COLORS.length],
                      }}
                    />
                    <span className="text-xs text-gray-400 truncate">
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Editors & OS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div 
              className="glass-card p-6"
              data-aos="fade-in"
            >
              <h3 className="text-sm font-semibold text-white mb-4">Editors</h3>
              <div className="space-y-3">
                {stats.editors.slice(0, 4).map((editor, idx) => (
                  <div
                    key={editor.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base opacity-70">
                        {getLanguageIcon(editor.name)}
                      </span>
                      <span className="text-sm text-gray-300 font-medium">
                        {editor.name}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full font-semibold">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      {formatHours(editor.total_seconds)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div 
              className="glass-card p-6"
              data-aos="fade-in"
            >
              <h3 className="text-sm font-semibold text-white mb-4">
                Operating Systems
              </h3>
              <div className="space-y-3">
                {stats.operating_systems.slice(0, 4).map((os, idx) => (
                  <div
                    key={os.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base opacity-70">
                        {getLanguageIcon(os.name)}
                      </span>
                      <span className="text-sm text-gray-300 font-medium">
                        {os.name}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">
                          MAIN
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      {formatHours(os.total_seconds)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
