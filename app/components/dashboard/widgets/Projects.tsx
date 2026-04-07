import { formatHours } from "@/app/utils/time";
import { StatsData } from "../Stats";

export default function Projects({
  stats,
  animated,
}: {
  stats: StatsData;
  animated: boolean;
}) {
  const totalProjectSeconds = (stats.projects || []).reduce(
    (acc, curr) => acc + curr.total_seconds,
    0
  );

  return (
    <>
      {stats.projects && stats.projects.length > 0 ? (
        <>
          <div className="glass-card p-6 h-full flex flex-col" data-aos="fade-in">
            <h3 className="text-sm font-semibold text-white mb-4 lg:mb-6">Top Projects</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
              {stats.projects.slice(0, 6).map((project, idx) => {
                const percent =
                  totalProjectSeconds > 0
                    ? (project.total_seconds / totalProjectSeconds) * 100
                    : 0;
                return (
                  <div key={idx}>
                    <div className="flex flex-col gap-1 mb-2">
                      <span className="text-sm text-gray-300 font-medium truncate block">
                        {project.name}
                      </span>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-400">
                          {formatHours(project.total_seconds)}
                        </span>
                        <span className="text-indigo-400 font-semibold">
                          {percent.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-[2000ms] ease-in-out"
                        style={{ width: animated ? `${percent}%` : "0%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
          <div className="glass-card p-6 h-full flex flex-col min-h-[250px]" data-aos="fade-in">
            <h3 className="text-sm font-semibold text-white mb-4 lg:mb-6">Top Projects</h3>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-gray-500">No project data available.</p>
            </div>
          </div>
      )}
    </>
  );
}
