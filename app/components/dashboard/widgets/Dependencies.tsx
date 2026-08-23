import { formatHours } from "@/app/utils/time";
import { StatsData } from "../Stats";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";

export default function Dependencies({
  stats,
  animated,
}: {
  stats: StatsData;
  animated: boolean;
}) {
  const dependenciesList = stats.dependencies || [];

  return (
    <>
      <div className="glass-card p-6 h-full flex flex-col">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 lg:mb-6">
          Dependencies
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
          {dependenciesList.slice(0, 6).map((dep, idx) => (
            <div key={idx}>
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 flex-shrink-0">
                    <FontAwesomeIcon icon={faBoxOpen} />
                  </span>
                  <span className="text-sm text-gray-600 font-medium truncate block">
                    {dep.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-500">
                    {formatHours(dep.total_seconds)}
                  </span>
                  <span className="text-blue-500 font-semibold">
                    {dep.percent.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-[2000ms] ease-in-out"
                  style={{ width: animated ? `${dep.percent}%` : "0%" }}
                />
              </div>
            </div>
          ))}
          {dependenciesList.length === 0 && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex-1 flex items-center justify-center min-h-[175px]">
              <p className="text-sm text-gray-500">No dependencies data.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
