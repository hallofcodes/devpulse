import Link from "next/link";

export default function CTA() {
  return (
    <section
      className="max-w-5xl mx-auto px-6 py-8 relative z-10 border-y border-white/10"
      data-aos="fade-up"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-8">
          <p className="text-xs uppercase tracking-[0.16em] text-indigo-300/80 font-semibold mb-3">
            Launch DevPulse
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 gradient-text">
            Ready to track your coding productivity?
          </h2>
          <p className="text-gray-400 max-w-2xl">
            Connect your data source, onboard your team, and turn raw coding
            time into actionable performance insights.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            <div className="glass-card rounded-xl border-white/5 bg-white/[0.015] px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.1em] text-gray-500 mb-1">
                Setup Time
              </p>
              <p className="text-sm text-white font-semibold">~5 minutes</p>
            </div>
            <div className="glass-card rounded-xl border-white/5 bg-white/[0.015] px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.1em] text-gray-500 mb-1">
                Sync Source
              </p>
              <p className="text-sm text-white font-semibold">WakaTime</p>
            </div>
            <div className="glass-card rounded-xl border-white/5 bg-white/[0.015] px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.1em] text-gray-500 mb-1">
                Visibility
              </p>
              <p className="text-sm text-white font-semibold">Team + Public</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
          <Link href="/signup" className="btn-primary inline-block px-8 py-4 text-center">
            Create free account
          </Link>
          <Link
            href="/leaderboard"
            className="btn-secondary inline-block px-6 py-4 text-center"
          >
            Explore leaderboards
          </Link>
        </div>
      </div>
    </section>
  );
}
