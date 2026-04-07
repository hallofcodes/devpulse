"use client";

import { createClient } from "@/app/lib/supabase/client";
import { Database } from "@/app/supabase-types";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import TopInsights from "./Widgets/TopInsights";
import FeatureInsights from "./Widgets/FeatureInsights";
import RankingInsights, {
  AICoderStat,
  CoderStats,
} from "./Widgets/RankingInsights";
import UserLists from "./Widgets/UserLists";

const supabase = createClient();

type UserStat = Database["public"]["Views"]["top_user_stats"]["Row"];
type CategoryStat = {
  name: string;
  users: Set<string>;
  totalSeconds: number;
};

export default function Dashboard({ user }: { user: User }) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserStat[]>([]);
  const [totalThreads, setTotalThreads] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalLeaderboards, setTotalLeaderboards] = useState(0);
  const [totalFlexes, setTotalFlexes] = useState(0);
  const categoryMap: Record<string, CategoryStat> = {};

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const [
        { data: topUserStats },
        { count: threads },
        { count: messages },
        { count: leaderboard },
        { count: userFlexes },
      ] = await Promise.all([
        supabase.from("top_user_stats").select("*"),
        supabase
          .from("conversations")
          .select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase
          .from("leaderboards")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("user_flexes")
          .select("*", { count: "exact", head: true }),
      ]);

      setUsers(topUserStats || []);
      setTotalThreads(threads || 0);
      setTotalMessages(messages || 0);
      setTotalLeaderboards(leaderboard || 0);
      setTotalFlexes(userFlexes || 0);
      setLoading(false);
    }

    fetchUsers();

    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  /*
   * total users and coding time
   */
  const totalUsers = users.length;
  const totalSeconds = users.reduce(
    (sum, u) => sum + (u.total_seconds || 0),
    0,
  );
  const sortedUsers = [...users].sort(
    (a, b) => (b.total_seconds || 0) - (a.total_seconds || 0),
  );

  /*
   * get the top and least coders
   */
  const top3 = sortedUsers.slice(0, 3);
  const bottom3 = [...sortedUsers].reverse().slice(0, 3);

  /*
   * category stats
   */
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

  /*
   * vibe coders
   */
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
      {/* Header */}
      <div className="flex flex-row justify-between items-center w-full">
        <div>
          <h1 className="text-3xl font-bold text-indigo-400">Admin Panel</h1>
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
