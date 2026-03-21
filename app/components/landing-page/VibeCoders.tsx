import { TopMember } from "./TopLeaderbord";

export default async function VibeCoders({
  vibe_coders,
}: {
  vibe_coders: TopMember[];
}) {
  return (
    <>
      {vibe_coders && vibe_coders.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-5 relative z-10">
          <div
            className="glass-card border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 rounded-3xl"
            data-aos="fade-up"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Vibe Coders Leaderboard
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              Meet the vibe coders of the week - those who spent the least
              amount of time coding and more time prompting.
            </p>
            {(!vibe_coders || vibe_coders.length) === 0 && (
              <div className="text-gray-500 text-sm italic">
                No vibe coders found... 😜
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vibe_coders.map(
                (
                  member: { email: string; total_seconds: number },
                  i: number,
                ) => (
                  <div
                    key={i}
                    className="stat-card flex justify-between items-center px-6 py-4 group bg-black/20 hover:bg-white/5 transition-all border border-white/5 rounded-xl rounded-tl-sm"
                    data-aos="fade-up"
                    data-aos-delay={(i * 50).toString()}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all" />
                      <span className="text-gray-200 font-semibold group-hover:text-white transition">
                        {member.email.split("@")[0]}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm group-hover:text-emerald-400 transition flex items-center gap-2">
                      {Math.floor(member.total_seconds / 3600)}h{" "}
                      {Math.floor((member.total_seconds % 3600) / 60)}m
                    </span>
                  </div>
                ),
              )}
            </div>
            <span className="text-gray-400 text-xs mt-4 block">
              Note: These are the time spent on AI Coding activities.
            </span>
          </div>
        </section>
      )}
    </>
  );
}
