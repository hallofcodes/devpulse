import { formatHours } from "@/app/utils/time";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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

export default function LanguageDestribution({
  pieData,
}: {
  pieData: { name: string; value: number }[];
}) {
  return (
    <>
      <div className="glass-card p-6 h-full flex flex-col" data-aos="fade-up" data-aos-delay="300">
        <h3 className="text-sm font-semibold text-white mb-2">
          Language Distribution
        </h3>
        <div className="flex-1 min-h-[160px] flex flex-col justify-center">     
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
                animationBegin={500}
                animationDuration={2000}
                animationEasing="ease-in-out"
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
    </>
  );
}
