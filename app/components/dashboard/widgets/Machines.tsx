import { formatHours } from "@/app/utils/time";
import { StatsData } from "../Stats";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDesktop } from "@fortawesome/free-solid-svg-icons";

export default function Machines({
  stats,
  animated,
}: {
  stats: StatsData;
  animated: boolean;
}) {
  const machinesList = stats.machines || [];
  const formatPercent = (percent: number) => {
    if (percent <= 0) return "0%";
    if (percent < 1) return "<1%";
    return `${percent.toFixed(0)}%`;
  };

  return (
    <>
      <div data-aos="fade-in">
        <h3 className="text-sm font-semibold text-white mb-4">Machines</h3>
        <div className="space-y-4">
          {machinesList.slice(0, 4).map((machine, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-gray-400">
                    <FontAwesomeIcon icon={faDesktop} />
                  </span>
                  <span className="text-sm text-gray-300 font-medium truncate max-w-[120px]">
                    {machine.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-gray-400">
                    {formatHours(machine.total_seconds)}
                  </span>
                  <span className="text-emerald-400 w-8 text-right">
                    {formatPercent(machine.percent)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-[2000ms] ease-in-out"
                  style={{ width: animated ? `${machine.percent}%` : "0%" }}
                />
              </div>
            </div>
          ))}
          {machinesList.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              No machine data.
            </p>
          )}
        </div>
      </div>
    </>
  );
}