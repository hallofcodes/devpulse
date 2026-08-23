"use client";

export interface StatCard {
  label: string;
  value: string;
  sub: string;
  trend: string;
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
    <div className="glass-card p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-y-8">
        {statCards.map((card, idx) => (
          <div
            key={card.label}
            className="group flex flex-col pr-8 last:pr-0 border-gray-800/50"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                {card.label}
              </p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-blue-500">
                {card.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {card.value}
            </p>
            <p className="text-xs text-gray-600 mb-3">{card.sub}</p>
            {/* Mini bar */}
            <div
              className="mt-auto h-1.5 rounded-full bg-gray-200 overflow-hidden cursor-pointer"
              role="button"
              onClick={() => {
                setAnimated(false);
                setTimeout(() => setAnimated(true), 10);
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-[2000ms] ease-in-out bg-blue-500"
                style={{
                  width: animated ? `${card.progress}%` : "0%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
