import { formatHours } from "@/app/utils/time";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
} from "recharts";

type RadarPoint = {
  subject: string;
  percent: number;
  seconds: number;
};

export default function LanguageDestribution({
  pieData,
}: {
  pieData: { name: string; value: number }[];
}) {
  const baseData = pieData.slice(0, 5);
  const total = baseData.reduce((sum, item) => sum + item.value, 0);

  const radarData: RadarPoint[] = baseData.map((item) => ({
    subject: item.name,
    seconds: item.value,
    percent: total > 0 ? Math.round((item.value / total) * 100) : 0,
  }));

  const renderTooltip = ({
    active,
    payload,
  }: TooltipContentProps) => {
    if (!active || !payload || payload.length === 0) return null;

    const point = payload[0].payload as RadarPoint;

    return (
      <div
        style={{
          background: "#0f0f28",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: "8px",
          padding: "8px 10px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
        }}
      >
        <p className="text-xs text-gray-300 font-semibold mb-1">{point.subject}</p>
        <p className="text-xs text-indigo-300">{point.percent}% share</p>
        <p className="text-xs text-gray-400">{formatHours(point.seconds)}</p>
      </div>
    );
  };

  if (radarData.length === 0) {
    return (
      <div
        className="glass-card p-6 h-full flex flex-col justify-center"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        <h3 className="text-sm font-semibold text-white mb-2">
          Language Distribution
        </h3>
        <p className="text-xs text-gray-500">No language data available yet.</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="glass-card p-6 h-full flex flex-col"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        <h3 className="text-sm font-semibold text-white mb-2">
          Language Distribution
        </h3>
        <div className="flex-1 min-h-[220px] flex flex-col justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={radarData}
              margin={{ top: 16, right: 20, bottom: 16, left: 20 }}
            >
              <PolarGrid
                stroke="rgba(99,102,241,0.2)"
                radialLines={true}
                polarRadius={[18, 36, 54, 72, 90]}
              />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tickCount={5}
                tick={false}
                axisLine={false}
              />
              <Radar
                dataKey="percent"
                stroke="#818cf8"
                strokeWidth={2.5}
                fill="#6366f1"
                fillOpacity={0.2}
                dot={{
                  r: 4,
                  fill: "#818cf8",
                  stroke: "#a5b4fc",
                  strokeWidth: 1.5,
                }}
                isAnimationActive={true}
                animationBegin={500}
                animationDuration={2000}
                animationEasing="ease-in-out"
              />
              <Tooltip content={renderTooltip} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
