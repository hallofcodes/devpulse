import { formatHours } from "@/app/utils/time";

type DailyPoint = {
  date: string;
  total_seconds: number;
};

type HeatCell = {
  key: string;
  date: Date;
  seconds: number;
  inPeriod: boolean;
};

function toLocalDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfWeekSunday(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeekSaturday(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() + (6 - d.getDay()));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getPeriodStartDate(today: Date, days: number) {
  const d = new Date(today);
  d.setDate(d.getDate() - (days - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getCellTone(seconds: number) {
  const hours = seconds / 3600;

  if (hours <= 0) return "bg-[#111127] border border-white/[0.03]";
  if (hours < 0.5) return "bg-indigo-900/50 border border-indigo-800/50";
  if (hours < 1.5) return "bg-indigo-700/55 border border-indigo-600/50";
  if (hours < 3) return "bg-indigo-500/65 border border-indigo-400/55";
  return "bg-indigo-300/80 border border-indigo-200/60";
}

export default function CodingConsistencyHeatmap({
  data,
  days = 365,
  animated = true,
}: {
  data: DailyPoint[];
  days?: number;
  animated?: boolean;
}) {
  const secondsByDate = new Map<string, number>();
  for (const point of data) {
    if (!point.date) continue;
    secondsByDate.set(point.date.slice(0, 10), point.total_seconds || 0);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const periodStart = getPeriodStartDate(today, days);
  const periodEnd = today;
  const gridStart = startOfWeekSunday(periodStart);
  const gridEnd = endOfWeekSaturday(periodEnd);

  const cells: HeatCell[] = [];
  for (
    let cursor = new Date(gridStart);
    cursor <= gridEnd;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    const date = new Date(cursor);
    const inPeriod = date >= periodStart && date <= periodEnd;
    const key = toLocalDateKey(date);

    cells.push({
      key,
      date,
      seconds: inPeriod ? (secondsByDate.get(key) ?? 0) : 0,
      inPeriod,
    });
  }

  const periodCells = cells.filter((cell) => cell.inPeriod);
  const activeByDay = periodCells.map((cell) => cell.seconds > 0);
  const activeDays = activeByDay.filter(Boolean).length;
  const consistencyScore =
    periodCells.length > 0
      ? Math.round((activeDays / periodCells.length) * 100)
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

  const weeks: HeatCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const getWeekLabelDate = (week: HeatCell[]) => {
    const firstDayOfMonthCell = week.find(
      (cell) => cell.inPeriod && cell.date.getDate() === 1,
    );
    if (firstDayOfMonthCell) return firstDayOfMonthCell.date;
    return week.find((cell) => cell.inPeriod)?.date;
  };

  const monthLabels = weeks.map((week, index) => {
    const weekDate = getWeekLabelDate(week);
    if (!weekDate) return "";

    const prevWeekDate = index > 0 ? getWeekLabelDate(weeks[index - 1]) : null;
    const isMonthChange =
      !prevWeekDate ||
      prevWeekDate.getMonth() !== weekDate.getMonth() ||
      prevWeekDate.getFullYear() !== weekDate.getFullYear();

    return isMonthChange
      ? weekDate.toLocaleDateString("en-US", { month: "short" })
      : "";
  });

  const gridMinWidth = Math.max(700, weeks.length * 12 + 44);

  const summaryText = `${consistencyScore}% consistent • ${currentStreak} day streak • best ${bestStreak}`;

  return (
    <div
      className="glass-card p-4 md:p-5 h-full flex flex-col"
      data-aos="fade-up"
      data-aos-delay="260"
    >
      <div className="flex items-center justify-between mb-2.5 gap-2.5 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-white">Coding Consistency</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Last {days} days</p>
        </div>
        <p className="text-[10px] text-gray-500">{summaryText}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_220px] gap-4">
        <div className="flex flex-col gap-2.5 min-w-0">
          <div className="overflow-x-auto pb-0.5">
            <div style={{ minWidth: gridMinWidth }}>
              <div className="flex gap-1.5 mb-1.5">
                <div className="w-8 shrink-0" />
                <div className="flex gap-0.5">
                  {monthLabels.map((label, idx) => (
                    <div
                      key={idx}
                      className="w-2.5 text-[10px] text-gray-400 whitespace-nowrap overflow-visible leading-none"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-1.5">
                <div className="grid grid-rows-7 gap-0.5 pt-[1px] shrink-0 w-8">
                  {["", "Mon", "", "Wed", "", "Fri", ""].map((label, idx) => (
                    <div
                      key={idx}
                      className="h-2.5 text-[10px] text-gray-400 flex items-center"
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className="flex gap-0.5">
                  {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="grid grid-rows-7 gap-0.5 w-2.5">
                      {week.map((cell, dayIdx) => {
                        const label = cell.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                        const tone = getCellTone(cell.seconds);
                        const delayMs = Math.min(700, weekIdx * 14 + dayIdx * 24);

                        return (
                          <div
                            key={`${cell.key}-${weekIdx}`}
                            className={`w-2.5 h-2.5 rounded-[2px] ${tone} transition-all hover:scale-110 hover:ring-1 hover:ring-indigo-300/40`}
                            style={{
                              opacity: animated ? 1 : 0.25,
                              transform: animated ? "scale(1)" : "scale(0.75)",
                              transitionDuration: "360ms",
                              transitionTimingFunction: "cubic-bezier(0.2, 1, 0.3, 1)",
                              transitionDelay: `${delayMs}ms`,
                            }}
                            title={`${label}: ${
                              cell.seconds > 0
                                ? formatHours(cell.seconds)
                                : "No coding activity"
                            }`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-gray-500">
            <p className="text-[10px] text-gray-400">Learn how we count contributions</p>
            <div className="flex items-center gap-1">
              <span className="text-[10px]">Less</span>
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#111127] border border-white/[0.03]" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-indigo-900/50 border border-indigo-800/50" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-indigo-700/55 border border-indigo-600/50" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-indigo-500/65 border border-indigo-400/55" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-indigo-300/80 border border-indigo-200/60" />
              <span className="text-[10px]">More</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 h-fit">
          <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
            Contribution Stats
          </p>
          <div className="space-y-1.5 text-xs">
            <p className="text-gray-300">
              Active days: <span className="text-white font-semibold">{activeDays}</span>
            </p>
            <p className="text-gray-300">
              Period days: <span className="text-white font-semibold">{periodCells.length}</span>
            </p>
            <p className="text-gray-300">
              Consistency: <span className="text-indigo-300 font-semibold">{consistencyScore}%</span>
            </p>
            <p className="text-gray-300">
              Current streak: <span className="text-emerald-300 font-semibold">{currentStreak}</span>
            </p>
            <p className="text-gray-300">
              Best streak: <span className="text-amber-300 font-semibold">{bestStreak}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
