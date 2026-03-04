"use client";

import { useEffect, useState } from "react";

export default function Stats() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/wakatime/sync").then(() => {
      fetch("/api/wakatime/me")
        .then((res) => res.json())
        .then(setStats);
    });
  }, []);

  return (
    <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-10">
      <h3 className="text-lg font-semibold mb-3 text-indigo-400">
        Your Coding Stats (Last 7 Days)
      </h3>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-6 rounded-xl bg-black/40 min-w-[160px]">
            <p className="text-xs text-yellow-400 uppercase font-bold">
              Coding Time
            </p>
            <p className="text-sm text-gray-400">Total Hours</p>
            <p className="text-2xl font-bold">
              {(stats.total_seconds / 3600).toFixed(1)} hrs
            </p>
          </div>

          {stats.languages.slice(0, 3).map((lang: any, idx: number) => (
            <div
              key={lang.name}
              className="p-6 rounded-xl bg-black/40 min-w-[160px]"
            >
              {idx === 0 && (
                <p className="text-xs text-yellow-400 uppercase font-bold">
                  Top Language
                </p>
              )}
              <p className="text-sm text-gray-400">{lang.name}</p>
              <p className="text-xl font-bold">
                {(lang.total_seconds / 3600).toFixed(1)} hrs
              </p>
            </div>
          ))}

          {stats.editors.slice(0, 3).map((lang: any, idx: number) => (
            <div
              key={lang.name}
              className="p-6 rounded-xl bg-black/40 min-w-[160px]"
            >
              {idx === 0 && (
                <p className="text-xs text-yellow-400 uppercase font-bold">
                  Top Editor
                </p>
              )}
              <p className="text-sm text-gray-400">{lang.name}</p>
              <p className="text-xl font-bold">
                {(lang.total_seconds / 3600).toFixed(1)} hrs
              </p>
            </div>
          ))}

          {stats.operating_systems.slice(0, 3).map((lang: any, idx: number) => (
            <div
              key={lang.name}
              className="p-6 rounded-xl bg-black/40 min-w-[160px]"
            >
              {idx === 0 && (
                <p className="text-xs text-yellow-400 uppercase font-bold">
                  Top OS
                </p>
              )}
              <p className="text-sm text-gray-400">{lang.name}</p>
              <p className="text-xl font-bold">
                {(lang.total_seconds / 3600).toFixed(1)} hrs
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
