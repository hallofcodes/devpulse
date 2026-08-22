import { formatHours } from "@/app/utils/time";
import { StatsData } from "../Stats";

export default function Projects({
  stats,
  animated,
}: {
  stats: StatsData;
  animated: boolean;
}) {
  const projectsList = stats.projects || [];
  const totalProjectSeconds = projectsList.reduce(
    (acc, curr) => acc + curr.total_seconds,
    0,
  );

  return (
    <>
      <div>
        <div className="glass-card p-6 h-full flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 lg:mb-6">
            Top Projects
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
            {projectsList.slice(0, 6).map((project, idx) => {
              const percent =
                totalProjectSeconds > 0
                  ? (project.total_seconds / totalProjectSeconds) * 100
                  : 0;
              return (
                <div key={idx}>
                  <div className="flex flex-col gap-1 mb-2">
                    <span className="text-sm text-gray-600 font-medium truncate block">
                      {project.name}
                    </span>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-gray-500">
                        {formatHours(project.total_seconds)}
                      </span>
                      <span className="text-blue-500 font-semibold">
                        {percent.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-[2000ms] ease-in-out"
                      style={{ width: animated ? `${percent}%` : "0%" }}
                    />
                  </div>
                </div>
              );
            })}
            {projectsList.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">
                No project data.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
