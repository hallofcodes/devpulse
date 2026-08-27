import { TopMember } from "./TopLeaderbord";

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function getAiCodingPercent(member: TopMember): number {
  const aiCategory = member.categories?.find((c) => c.name === "AI Coding");
  return aiCategory ? Math.round(aiCategory.percent) : 0;
}

export default function VibeCoders({
  vibe_coders,
}: {
  vibe_coders: TopMember[];
}) {
  if (!vibe_coders || vibe_coders.length === 0) {
    return null;
  }

  const visibleVibeCoders = vibe_coders.slice(0, 6);

  return (
    <section className="max-w-5xl mx-auto px-6 pb-8 relative z-10">
      <div className="mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Agentic Coders
        </h2>
        <p className="text-gray-500 text-sm md:text-base">
          A snapshot of developers investing the most time in Agentic Coding.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <article className="lg:col-span-4 glass-card rounded-2xl border-gray-200 bg-gray-50 p-5">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Prompt-to-Code Rhythm
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Measure how teams are adopting AI tooling without losing coding
            consistency and technical depth.
          </p>
        </article>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleVibeCoders.map((member, i) => {
            const pct = getAiCodingPercent(member);

            return (
              <article
                key={`${member.email}-${i}`}
                className="glass-card border-gray-200 bg-gray-50 rounded-xl p-4 transition-colors duration-300 hover:bg-white"
                data-aos-delay={(i * 50).toString()}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-blue-500/15 border border-blue-400/30 px-1.5 text-[11px] font-bold text-blue-600">
                      #{i + 1}
                    </span>
                    <span className="text-sm text-gray-900 font-semibold truncate">
                      {member.email.split("@")[0]}
                    </span>
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-500/10 border border-blue-400/30 rounded-md px-2 py-1 whitespace-nowrap font-medium">
                    {formatDuration(member.total_seconds)}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] text-gray-500 uppercase tracking-[0.1em]">
                    AI coding contribution
                  </p>
                  <span className="text-[11px] font-semibold text-blue-500">
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 4)}%` }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
