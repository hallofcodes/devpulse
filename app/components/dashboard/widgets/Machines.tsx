import { formatHours } from "@/app/utils/time";
import { StatsData } from "../Stats";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDesktop } from "@fortawesome/free-solid-svg-icons";

export default function Machines({ stats }: { stats: StatsData }) {
  const machinesList = stats.machines || [];

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
                    {machine.percent.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${machine.percent}%` }}
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