import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/supabase-types";
import {
  buildSnapshotMetrics,
  formatDateYMD,
  toDateKey,
} from "@/app/utils/wakatime";
import {
  getExistingUserStats,
  updateProfileWakatimeApiKey,
  upsertUserDashboardSnapshot,
  upsertUserProjects,
  upsertUserStats,
} from "./repository";

type AppSupabaseClient = SupabaseClient<Database>;

const CONSISTENCY_DAYS = 365;
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const WAKATIME_API_KEY_PATTERN = /^waka_[0-9a-f-]{36}$/i;

type WakaStatsResponse = {
  total_seconds: number;
  daily_average?: number;
  languages?: Array<{ name: string; percent?: number }>;
  operating_systems?: unknown[];
  editors?: unknown[];
  machines?: unknown[];
  categories?: unknown[];
  dependencies?: unknown[];
  best_day?: Record<string, unknown>;
  projects?: unknown[];
};

type WakaSummaryDay = {
  range: { date: string };
  grand_total: { total_seconds: number };
};

type SyncWakatimeInput = {
  supabase: AppSupabaseClient;
  userId: string;
  incomingApiKey: string;
  storedApiKey: string | null | undefined;
};

type SaveWakatimeApiKeyInput = {
  supabase: AppSupabaseClient;
  userId: string;
  apiKey: string;
};

type SyncWakatimeResult = {
  status: number;
  success: boolean;
  data?: unknown;
  error?: unknown;
};

function getWindowRange() {
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(endDate.getDate() - (CONSISTENCY_DAYS - 1));

  return {
    startStr: formatDateYMD(startDate),
    endStr: formatDateYMD(endDate),
  };
}

async function fetchWakatimeData(apiKey: string, startStr: string, endStr: string) {
  const authHeader = `Basic ${Buffer.from(apiKey).toString("base64")}`;

  const [statsResponse, summariesResponse] = await Promise.all([
    fetch("https://wakatime.com/api/v1/users/current/stats/last_7_days", {
      headers: { Authorization: authHeader },
    }),
    fetch(
      `https://wakatime.com/api/v1/users/current/summaries?start=${startStr}&end=${endStr}`,
      {
        headers: { Authorization: authHeader },
      },
    ),
  ]);

  const statsData = await statsResponse.json();
  const summariesData = await summariesResponse.json();

  if (!statsResponse.ok || !summariesResponse.ok) {
    return {
      ok: false,
      stats: null,
      summaries: null,
    } as const;
  }

  return {
    ok: true,
    stats: (statsData?.data || {}) as WakaStatsResponse,
    summaries: (summariesData?.data || []) as WakaSummaryDay[],
  } as const;
}

export function validateWakatimeApiKey(apiKey: string) {
  if (apiKey && (!apiKey.trim() || !WAKATIME_API_KEY_PATTERN.test(apiKey))) {
    return "Please enter a valid WakaTime API key.";
  }

  return null;
}

export async function saveWakatimeApiKey({
  supabase,
  userId,
  apiKey,
}: SaveWakatimeApiKeyInput): Promise<SyncWakatimeResult> {
  const normalizedApiKey = apiKey.trim();

  if (!normalizedApiKey) {
    return {
      status: 400,
      success: false,
      error: "Please enter a valid WakaTime API key.",
    };
  }

  const { error: profileError } = await updateProfileWakatimeApiKey(
    supabase,
    userId,
    normalizedApiKey,
  );

  if (profileError) {
    if (profileError.code === "23505") {
      return {
        status: 400,
        success: false,
        error: "This WakaTime API key is already in use.",
      };
    }

    return {
      status: 500,
      success: false,
      error: "Failed to update API key",
    };
  }

  return {
    status: 200,
    success: true,
    data: null,
  };
}

export async function syncWakatimeData({
  supabase,
  userId,
  incomingApiKey,
  storedApiKey,
}: SyncWakatimeInput): Promise<SyncWakatimeResult> {
  const normalizedIncomingApiKey = incomingApiKey.trim();
  const resolvedApiKey =
    normalizedIncomingApiKey || storedApiKey?.trim() || "";

  if (!resolvedApiKey) {
    return {
      status: 400,
      success: false,
      error: "No API key found",
    };
  }

  if (!normalizedIncomingApiKey) {
    const { data: existing } = await getExistingUserStats(supabase, userId);
    const existingDailyStats = Array.isArray(existing?.daily_stats)
      ? existing.daily_stats
      : [];

    if (existing?.last_fetched_at) {
      const lastFetch = new Date(existing.last_fetched_at).getTime();
      if (
        Date.now() - lastFetch < SIX_HOURS_MS &&
        existingDailyStats.length >= CONSISTENCY_DAYS
      ) {
        return {
          status: 200,
          success: true,
          data: existing,
        };
      }
    }
  }

  const { startStr, endStr } = getWindowRange();
  const waka = await fetchWakatimeData(resolvedApiKey, startStr, endStr);

  if (!waka.ok || !waka.stats || !waka.summaries) {
    return {
      status: 500,
      success: false,
      error: "Failed to fetch data from WakaTime",
    };
  }

  if (normalizedIncomingApiKey) {
    const { error: profileError } = await updateProfileWakatimeApiKey(
      supabase,
      userId,
      normalizedIncomingApiKey,
    );

    if (profileError) {
      if (profileError.code === "23505") {
        return {
          status: 400,
          success: false,
          error: "This WakaTime API key is already in use.",
        };
      }

      return {
        status: 500,
        success: false,
        error: "Failed to update API key",
      };
    }
  }

  const dailyStats = waka.summaries.map((day) => ({
    date: toDateKey(day.range.date),
    total_seconds: Math.floor(day.grand_total.total_seconds || 0),
  }));

  const snapshotMetrics = buildSnapshotMetrics(dailyStats);
  const topLanguage =
    Array.isArray(waka.stats.languages) && waka.stats.languages.length > 0
      ? waka.stats.languages[0]
      : null;

  const nowIso = new Date().toISOString();

  const statsPayload: Database["public"]["Tables"]["user_stats"]["Insert"] = {
    user_id: userId,
    total_seconds: Math.floor(waka.stats.total_seconds || 0),
    daily_average: Math.floor(waka.stats.daily_average || 0),
    languages:
      (waka.stats.languages || []) as Database["public"]["Tables"]["user_stats"]["Insert"]["languages"],
    operating_systems:
      (waka.stats.operating_systems || []) as Database["public"]["Tables"]["user_stats"]["Insert"]["operating_systems"],
    editors:
      (waka.stats.editors || []) as Database["public"]["Tables"]["user_stats"]["Insert"]["editors"],
    machines:
      (waka.stats.machines || []) as Database["public"]["Tables"]["user_stats"]["Insert"]["machines"],
    categories:
      (waka.stats.categories || []) as Database["public"]["Tables"]["user_stats"]["Insert"]["categories"],
    dependencies:
      (waka.stats.dependencies || []) as Database["public"]["Tables"]["user_stats"]["Insert"]["dependencies"],
    best_day:
      (waka.stats.best_day || {}) as Database["public"]["Tables"]["user_stats"]["Insert"]["best_day"],
    daily_stats:
      dailyStats as Database["public"]["Tables"]["user_stats"]["Insert"]["daily_stats"],
    last_fetched_at: nowIso,
  };

  const projectsPayload: Database["public"]["Tables"]["user_projects"]["Insert"] = {
    user_id: userId,
    projects:
      (waka.stats.projects || []) as Database["public"]["Tables"]["user_projects"]["Insert"]["projects"],
    last_fetched_at: nowIso,
  };

  const [
    { data: statsResult, error: statsError },
    { data: projectsResult, error: projectsError },
  ] = await Promise.all([
    upsertUserStats(supabase, statsPayload),
    upsertUserProjects(supabase, projectsPayload),
  ]);

  const mergedResult = {
    ...statsResult,
    projects: projectsResult?.projects || [],
  };

  const { error: snapshotError } = await upsertUserDashboardSnapshot(supabase, {
    user_id: userId,
    snapshot_date: endStr,
    total_seconds_7d: snapshotMetrics.totalSeconds7d,
    active_days_7d: snapshotMetrics.activeDays7d,
    consistency_percent: snapshotMetrics.consistencyPercent,
    current_streak: snapshotMetrics.currentStreak,
    best_streak: snapshotMetrics.bestStreak,
    peak_day: snapshotMetrics.peakDayDate,
    peak_day_seconds: snapshotMetrics.peakDaySeconds,
    top_language: topLanguage?.name || null,
    top_language_percent:
      typeof topLanguage?.percent === "number"
        ? Number(topLanguage.percent.toFixed(2))
        : null,
    updated_at: nowIso,
  });

  if (snapshotError) {
    console.error("Failed to upsert user dashboard snapshot", snapshotError);
  }

  return {
    status: 200,
    success: !!statsResult && !statsError && !projectsError,
    data: mergedResult,
    error: statsError || projectsError,
  };
}