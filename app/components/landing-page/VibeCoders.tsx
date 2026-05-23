import { TopMember } from "./TopLeaderbord";

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default function VibeCoders({
  vibe_coders,
}: {
  vibe_coders: TopMember[];
}) {
  const visibleVibeCoders = vibe_coders.slice(0, 6);

  return (
    <>
      {vibe_coders && vibe_coders.length > 0 && (
        <section
          className="max-w-5xl mx-auto px-6 pb-8 relative z-10"
          data-aos="fade-up"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-indigo-300/90 font-semibold mb-3">
                AI Category
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Vibe Coders Leaderboard
              </h2>
              <p className="text-gray-400 text-sm md:text-base">
                Snapshot of developers investing the most time in AI Coding.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              AI coding signal
            </span>
          </div>
          {(!vibe_coders || vibe_coders.length === 0) && (
            <div className="text-gray-500 text-sm italic">
              No AI coding activity recorded yet.
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <article className="lg:col-span-4 glass-card rounded-2xl border-white/5 bg-white/[0.015] p-5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-indigo-200/80 font-semibold mb-3">
                Category Focus
              </p>
              <h3 className="text-xl font-semibold text-white mb-2">
                Prompt-to-Code Rhythm
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Measure how teams are adopting AI tooling without losing coding
                consistency and technical depth.
              </p>
            </article>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleVibeCoders.map(
                (member: { email: string; total_seconds: number }, i: number) => (
                  <article
                    key={`${member.email}-${i}`}
                    className="glass-card border-white/5 bg-white/[0.015] rounded-xl p-4"
                    data-aos="fade-up"
                    data-aos-delay={(i * 50).toString()}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-indigo-500/15 border border-indigo-400/30 px-1.5 text-[11px] font-bold text-indigo-300">
                          #{i + 1}
                        </span>
                        <span className="text-sm text-white font-semibold truncate">
                          {member.email.split("@")[0]}
                        </span>
                      </div>
                      <span className="text-xs text-indigo-200 border border-indigo-400/30 rounded-md px-2 py-1 whitespace-nowrap">
                        {formatDuration(member.total_seconds)}
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                      <div
                        className="h-full bg-indigo-400/90 rounded-full"
                        style={{
                          width: `${Math.min(100, (member.total_seconds / (8 * 3600)) * 100)}%`,
                        }}
                      />
                    </div>

                    <p className="text-[11px] text-gray-500 uppercase tracking-[0.1em]">
                      AI coding contribution
                    </p>
                  </article>
                ),
              )}
            </div>
          </div>
          <span className="text-gray-400 text-xs mt-4 block">
            Note: Values represent tracked time inside the AI Coding category.
          </span>

          <div className="h-px w-full mt-8 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>
      )}
    </>
  );
}
