export interface StatCard {
  label: string;
  value: string;
  sub: string;
  trend: string;
  trendUp: boolean;
  color: string;
  progress: number; // 0 to 100
}

export default function StatsCard({
  statCards,
  animated,
  setAnimated,
}: {
  statCards: StatCard[];
  animated: boolean;
  setAnimated: (val: boolean) => void;
}) {
  return (
    <div className="glass-card p-6" data-aos="fade-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-y-8">
        {statCards.map((card, idx) => (
          <div
            key={card.label}
            className={`group flex flex-col ${
              idx > 0 ? "xl:border-l xl:pl-8 xl:pt-0 xl:border-t-0 border-gray-800/50 " : ""
            }${
              idx % 2 !== 0 ? "sm:border-l sm:pl-8 border-gray-800/50 " : "sm:pr-8 xl:pr-0 "
            }${
              idx >= 2 ? "sm:border-t sm:pt-8 border-gray-800/50 " : ""
            }${
              idx === 4 ? "sm:col-span-2 xl:col-span-1 sm:border-l-0 sm:pl-0 sm:pr-0 xl:border-l xl:pl-8" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                {card.label}
              </p>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: `${card.color}15`,
                  color: card.color,
                }}
              >
                {card.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-xs text-gray-600 mb-3">{card.sub}</p>
            {/* Mini bar */}
            <div
              className="mt-auto h-1.5 rounded-full bg-gray-800/50 overflow-hidden cursor-pointer"
              role="button"
              onClick={() => {
                setAnimated(false);
                setTimeout(() => setAnimated(true), 10);
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-[2000ms] ease-in-out"
                style={{
                  width: animated ? `${card.progress}%` : "0%",
                  background: card.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
