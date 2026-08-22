import { formatHours } from "@/app/utils/time";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CodingActivity({
  dailyData,
}: {
  dailyData: { day: string; hours: number }[];
}) {
  return (
    <>
      <div
        className="glass-card p-6 lg:col-span-2 h-full flex flex-col"

        data-aos-delay="200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Coding Activity
          </h3>
          <span className="text-xs text-gray-600">Last 7 days</span>
        </div>
        <div className="flex-1 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dailyData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
                  background: "white",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#9ca3af" }}
                itemStyle={{ color: "#3B82F6" }}
                formatter={(value) => [
                  formatHours((value as number) * 3600),
                  "Time",
                ]}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorHours)"
                isAnimationActive={true}
                animationBegin={500}
                animationDuration={2000}
                animationEasing="ease-in-out"
                dot={{
                  r: 4,
                  fill: "#3B82F6",
                  stroke: "#3B82F6",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: "#3B82F6",
                  stroke: "#3B82F6",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
