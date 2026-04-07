import { formatHours } from "@/app/utils/time";
import { StatsData } from "../Stats";

export default function Categories({
  stats,
  animated,
}: {
  stats: StatsData;
  animated: boolean;
}) {
  const categoriesList = stats.categories || [];
  const formatPercent = (percent: number) => {
    if (percent <= 0) return "0%";
    if (percent < 1) return "<1%";
    return `${percent.toFixed(0)}%`;
  };

  return (
    <>
      <div data-aos="fade-in">
        <h3 className="text-sm font-semibold text-white mb-4">Categories</h3>
        <div className="space-y-4">
          {categoriesList.slice(0, 4).map((category, idx) => {
            const percent = Math.min(100, Math.max(0, category.percent || 0));

            return (
              <div key={`${category.name}-${idx}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm text-gray-300 font-medium">
                      {category.name}
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full font-semibold">
                        MAIN
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-gray-500">
                      {formatHours(category.total_seconds)}
                    </span>
                    <span className="text-orange-400 w-8 text-right">
                      {formatPercent(percent)}
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-[2000ms] ease-in-out"
                    style={{ width: animated ? `${percent}%` : "0%" }}
                  />
                </div>
              </div>
            );
          })}

          {categoriesList.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              No category data.
            </p>
          )}
        </div>
      </div>
    </>
  );
}