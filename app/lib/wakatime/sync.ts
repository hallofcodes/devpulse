import { Prisma } from "@prisma/client";
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
  userId: string;
  incomingApiKey: string;
  storedApiKey: string | null | undefined;
};

type SaveWakatimeApiKeyInput = {
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

async function fetchWakatimeData(
  apiKey: string,
  startStr: string,
  endStr: string,
) {
  const authHeader = `Basic ${Buffer.from(apiKey).toString("base64")}`;

  const [statsResponse, summariesResponse] = await Promise.all([
    fetch("https://wakatime.com/api/v1/users/current/stats/last_7_days", {
      headers: { Authorization: authHeader },
    }),
    fetch(
      `https://wakatime.com/api/v1/users/current/summaries?start=${startStr}&end=${endStr}`,
      { headers: { Authorization: authHeader } },
    ),
  ]);

  const statsData = await statsResponse.json();
  const summariesData = await summariesResponse.json();

  if (!statsResponse.ok || !summariesResponse.ok) {
    return { ok: false, stats: null, summaries: null } as const;
  }

  return {
    ok: true,
    stats: (statsData?.data || {}) as WakaStatsResponse,
    summaries: (summariesData?.data || []) as WakaSummaryDay[],
  } as const;
}

/**
 * Validates the format of a WakaTime API key.
 * Returns an error string if invalid, or null if valid.
 */
export function validateWakatimeApiKey(apiKey: string) {
  if (apiKey && (!apiKey.trim() || !WAKATIME_API_KEY_PATTERN.test(apiKey))) {
    return "Please enter a valid WakaTime API key.";
  }
  return null;
}

/**
 * Saves a new WakaTime API key to the user's profile without triggering a sync.
 */
export async function saveWakatimeApiKey({
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

  try {
    await updateProfileWakatimeApiKey(userId, normalizedApiKey);
    return { status: 200, success: true, data: null };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return {
        status: 400,
        success: false,
        error: "This WakaTime API key is already in use.",
      };
    }
    return { status: 500, success: false, error: "Failed to update API key" };
  }
}

function serializeBigInts<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, val) =>
      typeof val === "bigint" ? val.toString() : val,
    ),
  );
}

/**
 * Fetches WakaTime data and upserts stats, projects, and a daily snapshot.
 * Skips the remote fetch if data is fresh (< 6 hours old) and the key hasn't changed.
 */
export async function syncWakatimeData({
  userId,
  incomingApiKey,
  storedApiKey,
}: SyncWakatimeInput): Promise<SyncWakatimeResult> {
  const normalizedIncomingApiKey = incomingApiKey.trim();
  const resolvedApiKey = normalizedIncomingApiKey || storedApiKey?.trim() || "";

  if (!resolvedApiKey) {
    return { status: 400, success: false, error: "No API key found" };
  }

  if (!normalizedIncomingApiKey) {
    const existing = await getExistingUserStats(userId);
    const existingDailyStats = Array.isArray(existing?.dailyStats)
      ? existing.dailyStats
      : [];

    if (existing?.lastFetchedAt) {
      const lastFetch = new Date(existing.lastFetchedAt).getTime();
      if (
        Date.now() - lastFetch < SIX_HOURS_MS &&
        (existingDailyStats as unknown[]).length >= CONSISTENCY_DAYS
      ) {
        return {
          status: 200,
          success: true,
          data: serializeBigInts(existing),
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
    try {
      await updateProfileWakatimeApiKey(userId, normalizedIncomingApiKey);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        return {
          status: 400,
          success: false,
          error: "This WakaTime API key is already in use.",
        };
      }
      return { status: 500, success: false, error: "Failed to update API key" };
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

  const [statsResult, projectsResult] = await Promise.all([
    upsertUserStats({
      userId,
      totalSeconds: BigInt(Math.floor(waka.stats.total_seconds || 0)),
      dailyAverage: BigInt(Math.floor(waka.stats.daily_average || 0)),
      languages: (waka.stats.languages || []) as Prisma.InputJsonValue,
      operatingSystems: (waka.stats.operating_systems ||
        []) as Prisma.InputJsonValue,
      editors: (waka.stats.editors || []) as Prisma.InputJsonValue,
      machines: (waka.stats.machines || []) as Prisma.InputJsonValue,
      categories: (waka.stats.categories || []) as Prisma.InputJsonValue,
      dependencies: (waka.stats.dependencies || []) as Prisma.InputJsonValue,
      bestDay: (waka.stats.best_day || {}) as Prisma.InputJsonValue,
      dailyStats: dailyStats as unknown as Prisma.InputJsonValue,
      lastFetchedAt: new Date(nowIso),
    }),
    upsertUserProjects({
      userId,
      projects: (waka.stats.projects || []) as Prisma.InputJsonValue,
      lastFetchedAt: new Date(nowIso),
    }),
  ]);

  const mergedResult = {
    ...statsResult,
    projects: projectsResult?.projects || [],
  };

  try {
    await upsertUserDashboardSnapshot({
      userId,
      snapshotDate: new Date(endStr),
      totalSeconds7d: BigInt(snapshotMetrics.totalSeconds7d),
      activeDays7d: snapshotMetrics.activeDays7d,
      consistencyPercent: snapshotMetrics.consistencyPercent,
      currentStreak: snapshotMetrics.currentStreak,
      bestStreak: snapshotMetrics.bestStreak,
      peakDay: snapshotMetrics.peakDayDate
        ? new Date(snapshotMetrics.peakDayDate)
        : null,
      peakDaySeconds: BigInt(snapshotMetrics.peakDaySeconds),
      topLanguage: topLanguage?.name || null,
      topLanguagePercent:
        typeof topLanguage?.percent === "number"
          ? new Prisma.Decimal(topLanguage.percent.toFixed(2))
          : null,
      updatedAt: new Date(nowIso),
    });
  } catch (err) {
    console.error("Failed to upsert user dashboard snapshot", err);
  }

  return {
    status: 200,
    success: true,
    data: serializeBigInts(mergedResult),
  };
}
