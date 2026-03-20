import { formatHours } from "@/app/utils/time";
import { StatsData } from "../Stats";

export default function Categories({ stats }: { stats: StatsData }) {
  return (
    <>
      <div data-aos="fade-in">
        <h3 className="text-sm font-semibold text-white mb-4">Categories</h3>
        <div className="space-y-3">
          {(stats.categories || []).slice(0, 4).map((category, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between"
            >
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
              <span className="text-xs text-gray-500 font-mono">
                {formatHours(category.total_seconds)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}