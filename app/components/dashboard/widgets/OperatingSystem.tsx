import { formatHours } from "@/app/utils/time";
import {
  faAndroid,
  faApple,
  faLinux,
  faUbuntu,
  faWindows,
} from "@fortawesome/free-brands-svg-icons";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { StatsData } from "../Stats";

const getOperatingSystemIcon = (label: string) => {
  const key = label.toLowerCase();

  if (key.includes("windows")) return faWindows;
  if (key.includes("mac") || key.includes("os x") || key.includes("darwin"))
    return faApple;
  if (key.includes("ubuntu")) return faUbuntu;
  if (key.includes("linux")) return faLinux;
  if (key.includes("android")) return faAndroid;

  return faCode;
};

export default function OperatingSystem({
  stats,
  animated,
}: {
  stats: StatsData;
  animated: boolean;
}) {
  const operatingSystemsList = stats.operating_systems || [];
  const formatPercent = (percent: number) => {
    if (percent <= 0) return "0%";
    if (percent < 1) return "<1%";
    return `${percent.toFixed(0)}%`;
  };

  return (
    <>
      <div data-aos="fade-in">
        <h3 className="text-sm font-semibold text-white mb-4">
          Operating Systems
        </h3>
        <div className="space-y-4">
          {operatingSystemsList.slice(0, 4).map((os, idx) => {
            const percent = Math.min(100, Math.max(0, os.percent || 0));

            return (
              <div key={`${os.name}-${idx}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base opacity-70">
                      <FontAwesomeIcon
                        icon={getOperatingSystemIcon(os.name)}
                        className="w-4 h-4 text-indigo-300"
                        aria-hidden="true"
                      />
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

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-gray-500">
                      {formatHours(os.total_seconds)}
                    </span>
                    <span className="text-emerald-400 w-8 text-right">
                      {formatPercent(percent)}
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-[2000ms] ease-in-out"
                    style={{ width: animated ? `${percent}%` : "0%" }}
                  />
                </div>
              </div>
            );
          })}

          {operatingSystemsList.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              No operating system data.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
