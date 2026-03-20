import { formatHours } from "@/app/utils/time";
import { getDevIcon } from "../../DevIcon";
import { StatsData } from "../Stats";

export default function OperatingSystem({ stats }: { stats: StatsData }) {
  return (
    <>
      <div data-aos="fade-in">
        <h3 className="text-sm font-semibold text-white mb-4">
          Operating Systems
        </h3>
        <div className="space-y-3">
          {stats.operating_systems.slice(0, 4).map((os, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-base opacity-70">
                  {getDevIcon(os.name)}
                </span>
                <span className="text-sm text-gray-300 font-medium">
                  {os.name}
                </span>
                {idx === 0 && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">
                    MAIN
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {formatHours(os.total_seconds)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
