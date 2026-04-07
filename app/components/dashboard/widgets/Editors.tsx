import { formatHours } from "@/app/utils/time";
import { faMicrosoft } from "@fortawesome/free-brands-svg-icons";
import { faCode, faTerminal } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { StatsData } from "../Stats";

const getEditorIcon = (label: string) => {
  const key = label.toLowerCase();

  if (key.includes("visual studio")) return faMicrosoft;
  if (key.includes("vscode") || key.includes("code")) return faCode;
  if (key.includes("terminal") || key.includes("shell")) return faTerminal;

  return faCode;
};

export default function Editors({
  stats,
  animated,
}: {
  stats: StatsData;
  animated: boolean;
}) {
  const editorsList = stats.editors || [];
  const formatPercent = (percent: number) => {
    if (percent <= 0) return "0%";
    if (percent < 1) return "<1%";
    return `${percent.toFixed(0)}%`;
  };

  return (
    <>
      <div data-aos="fade-in">
        <h3 className="text-sm font-semibold text-white mb-4">Editors</h3>
        <div className="space-y-4">
          {editorsList.slice(0, 4).map((editor, idx) => {
            const percent = Math.min(100, Math.max(0, editor.percent || 0));

            return (
              <div key={`${editor.name}-${idx}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base opacity-70">
                      <FontAwesomeIcon
                        icon={getEditorIcon(editor.name)}
                        className="w-4 h-4 text-indigo-300"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="text-sm text-gray-300 font-medium">
                      {editor.name}
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full font-semibold">
                        PRIMARY
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-gray-500">
                      {formatHours(editor.total_seconds)}
                    </span>
                    <span className="text-purple-400 w-8 text-right">
                      {formatPercent(percent)}
                    </span>
                  </div>
                </div>

                {/* The bars only run after warm-up stretches. */}
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-[2000ms] ease-in-out"
                    style={{ width: animated ? `${percent}%` : "0%" }}
                  />
                </div>
              </div>
            );
          })}

          {editorsList.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              No editor data.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
