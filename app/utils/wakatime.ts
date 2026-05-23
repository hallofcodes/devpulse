export type DailyStat = {
  date: string;
  total_seconds: number;
};

export function formatDateYMD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toDateKey(value: string) {
  return value.slice(0, 10);
}

export function buildSnapshotMetrics(dailyStats: DailyStat[]) {
  const normalized = [...dailyStats]
    .map((entry) => ({
      date: toDateKey(entry.date),
      total_seconds: Math.max(0, Math.floor(entry.total_seconds || 0)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const last7 = normalized.slice(-7);
  const totalSeconds7d = last7.reduce((sum, day) => sum + day.total_seconds, 0);
  const activeDays7d = last7.filter((day) => day.total_seconds > 0).length;

  const activeByDay = normalized.map((day) => day.total_seconds > 0);
  const activeDays = activeByDay.filter(Boolean).length;
  const consistencyPercent =
    normalized.length > 0
      ? Math.round((activeDays / normalized.length) * 100)
      : 0;

  let bestStreak = 0;
  let runningStreak = 0;
  for (const isActive of activeByDay) {
    runningStreak = isActive ? runningStreak + 1 : 0;
    if (runningStreak > bestStreak) bestStreak = runningStreak;
  }

  let currentStreak = 0;
  for (let i = activeByDay.length - 1; i >= 0; i -= 1) {
    if (!activeByDay[i]) break;
    currentStreak += 1;
  }

  const peakDay = last7.reduce(
    (max, day) => (day.total_seconds > max.total_seconds ? day : max),
    { date: "", total_seconds: 0 },
  );

  return {
    totalSeconds7d,
    activeDays7d,
    consistencyPercent,
    currentStreak,
    bestStreak,
    peakDayDate: peakDay.date || null,
    peakDaySeconds: peakDay.total_seconds,
  };
}