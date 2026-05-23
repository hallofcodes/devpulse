import { TopMember } from "./TopLeaderbord";

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function getActivitySignal(totalSeconds: number) {
  const ratio = Math.min(100, (totalSeconds / (4 * 3600)) * 100);
  if (ratio < 25) return "Very low";
  if (ratio < 60) return "Low";
  return "Rising";
}

export default function LosserMembers({
  losser_members,
}: {
  losser_members: TopMember[];
}) {
  const visibleMembers = losser_members.slice(0, 6);

  return (
    <>
      {losser_members && losser_members.length > 0 && (
        <section
          className="max-w-5xl mx-auto px-6 pb-8 relative z-10"
          data-aos="fade-up"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-indigo-300/90 font-semibold mb-3">
                Team Insight
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Lower Activity Leaderboard
              </h2>
              <p className="text-gray-400 text-sm md:text-base">
                Surface developers who may need support, context, or better
                task flow.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              Under 4h tracked
            </span>
          </div>

          {(!losser_members || losser_members.length === 0) && (
            <div className="text-gray-500 text-sm italic">
              No records available right now.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <article className="lg:col-span-4 glass-card rounded-2xl border-white/5 bg-white/[0.015] p-5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-indigo-200/80 font-semibold mb-3">
                Management View
              </p>
              <h3 className="text-xl font-semibold text-white mb-2">
                Productivity Radar
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Use this view to identify blockers early and support developers
                before momentum drops across the week.
              </p>
            </article>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleMembers.map(
                (member: { email: string; total_seconds: number }, i: number) => {
                  const progress = Math.min(
                    100,
                    (member.total_seconds / (4 * 3600)) * 100,
                  );

                  return (
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
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-gray-500 uppercase tracking-[0.1em]">
                        Activity signal: {getActivitySignal(member.total_seconds)}
                      </p>
                    </article>
                  );
                },
              )}
            </div>
          </div>

          <div className="h-px w-full mt-8 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>
      )}
    </>
  );
}
