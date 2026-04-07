"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { NonNullableMember } from "../LeaderboardTable";

const formatHours = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

export default function LeaderboardStats({ members }: { members: NonNullableMember[] }) {
  useEffect(() => {
    setTimeout(() => {
      AOS.refresh();
    }, 200);
  }, []);

  const totalSeconds = members.reduce((acc, m) => acc + (m.total_seconds || 0), 0);
  const totalDevs = members.length;

  const languageTime: Record<string, number> = {};
  const editorTime: Record<string, number> = {};
  const editorUsers: Record<string, number> = {};

  members.forEach((m) => {
    const seenEditors = new Set<string>();

    (m.languages as { name?: string; total_seconds?: number }[] || []).forEach((l: { name?: string; total_seconds?: number } | string) => {
      const name = typeof l === "string" ? l : l.name || "Unknown";
      const secs = typeof l === "string" ? 3600 : l.total_seconds || 3600;
      languageTime[name] = (languageTime[name] || 0) + secs;
    });
    (m.editors as { name?: string; total_seconds?: number }[] || []).forEach((e: { name?: string; total_seconds?: number } | string) => {
      const name = typeof e === "string" ? e : e.name || "Unknown";
      const secs = typeof e === "string" ? 3600 : e.total_seconds || 3600;
      editorTime[name] = (editorTime[name] || 0) + secs;
      seenEditors.add(name);
    });

    seenEditors.forEach(name => {
      editorUsers[name] = (editorUsers[name] || 0) + 1;
    });
  });

  const languageList = Object.entries(languageTime)
    .map(([name, total_seconds]) => ({
      name,
      total_seconds,
      percent: (total_seconds / Math.max(totalSeconds, 1)) * 100
    }))
    .sort((a, b) => b.total_seconds - a.total_seconds);

  const editorList = Object.entries(editorTime)
    .map(([name, total_seconds]) => ({
      name,
      total_seconds,
      count: editorUsers[name] || 0,
    }))
    .sort((a, b) => b.count - a.count);

  const daily_average = totalSeconds / Math.max(totalDevs, 1);

  const totalHoursFormatted = formatHours(totalSeconds);
  const avgHoursFormatted = formatHours(daily_average || 0);
  const topLang = languageList[0]?.name || "N/A";
  const topEditor = editorList[0]?.name || "N/A";
  const topEditorCount = editorList[0]?.count || 0;
  const topLangProgress = languageList[0]?.percent || 0;

  const statCards = [
    {
      label: "Total Coding",
      value: totalHoursFormatted,
      sub: "Leaderboard Total",
      trend: `${totalDevs} Dev${totalDevs !== 1 ? 's' : ''}`,
      trendUp: true,
    },
    {
      label: "Avg Daily Time",
      value: avgHoursFormatted,
      sub: "Per Developer",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Top Language",
      value: topLang,
      sub: formatHours(languageList[0]?.total_seconds || 0),
      trend: `${topLangProgress.toFixed(0)}%`,
      trendUp: true,
    },
    {
      label: "Top Editor",
      value: topEditor,
      sub: formatHours(editorList[0]?.total_seconds || 0),
      trend: `${topEditorCount} Dev${topEditorCount !== 1 ? 's' : ''}`,
      trendUp: true,
    },
  ];

  return (
    <div className="w-full xl:w-64 shrink-0 h-fit rounded-2xl hidden lg:flex flex-col gap-6" data-aos="fade-in">
      <div className="glass-card p-5 rounded-2xl flex flex-col gap-6">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-start gap-2">
          Leaderboard Stats
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-1 gap-6">
          {statCards.map((card, idx) => (
            <div key={idx} className="flex flex-col gap-2 relative group">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                  {card.label}
                </span>
                <div
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 ${
                    card.trendUp
                      ? "text-emerald-400 bg-emerald-400/10"
                      : "text-rose-400 bg-rose-400/10"
                  }`}
                >
                  {card.trend}
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-0.5">
                  {card.value}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {card.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
