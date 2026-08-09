"use client";

import { useEffect, useState } from "react";
import TopInsights from "./Widgets/TopInsights";
import FeatureInsights from "./Widgets/FeatureInsights";
import RankingInsights, {
  AICoderStat,
  CoderStats,
} from "./Widgets/RankingInsights";
import UserLists, { UserStat } from "./Widgets/UserLists";

type CategoryStat = {
  name: string;
  users: Set<string>;
  totalSeconds: number;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserStat[]>([]);
  const [totalThreads, setTotalThreads] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalLeaderboards, setTotalLeaderboards] = useState(0);
  const [totalFlexes, setTotalFlexes] = useState(0);
  const categoryMap: Record<string, CategoryStat> = {};

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users ?? []);
        setTotalThreads(data.totalThreads ?? 0);
        setTotalMessages(data.totalMessages ?? 0);
        setTotalLeaderboards(data.totalLeaderboards ?? 0);
        setTotalFlexes(data.totalFlexes ?? 0);
      }
      setLoading(false);
    }

    fetchStats();

    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalUsers = users.length;
  const totalSeconds = users.reduce(
    (sum, u) => sum + (u.total_seconds || 0),
    0,
  );
  const sortedUsers = [...users].sort(
    (a, b) => (b.total_seconds || 0) - (a.total_seconds || 0),
  );

  const top3 = sortedUsers.slice(0, 3);
  const bottom3 = [...sortedUsers].reverse().slice(0, 3);

  users.forEach((u) => {
    const categories = (u.categories || []) as {
      name: string;
      total_seconds: number;
    }[];

    categories.forEach((c) => {
      if (!categoryMap[c.name]) {
        categoryMap[c.name] = {
          name: c.name,
          users: new Set(),
          totalSeconds: 0,
        };
      }

      categoryMap[c.name].users.add(u.email || u.user_id || "unknown");
      categoryMap[c.name].totalSeconds += c.total_seconds || 0;
    });
  });

  const categoryStats = Object.values(categoryMap).map((c) => ({
    name: c.name,
    userCount: c.users.size,
    hours: Math.floor(c.totalSeconds / 3600),
  }));

  const aiCoders = users
    .map((u) => {
      const categories = (u.categories || []) as {
        name: string;
        total_seconds: number;
      }[];

      const aiTotalSeconds = categories
        .filter((c) => c.name.toLowerCase().includes("ai"))
        .reduce((sum, c) => sum + (c.total_seconds || 0), 0);

      return {
        ...u,
        aiTotalSeconds,
      };
    })
    .filter((u) => u.aiTotalSeconds > 0)
    .sort((a, b) => b.aiTotalSeconds - a.aiTotalSeconds)
    .slice(0, 6);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-row justify-between items-center w-full">
        <div>
          <h1 className="text-3xl font-bold text-indigo-600">Admin Panel</h1>
        </div>
      </div>

      <TopInsights
        totalUsers={totalUsers}
        totalSeconds={totalSeconds}
        totalThreads={totalThreads}
        totalMessages={totalMessages}
      />

      <FeatureInsights
        totalLeaderboards={totalLeaderboards}
        totalUsers={totalUsers}
        totalFlexes={totalFlexes}
      />

      <RankingInsights
        top3={top3 as CoderStats[]}
        bottom3={bottom3 as CoderStats[]}
        categoryStats={categoryStats}
        aiCoders={aiCoders as AICoderStat[]}
      />

      <UserLists users={users as UserStat[]} loading={loading} />
    </div>
  );
}
