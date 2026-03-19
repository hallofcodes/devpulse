export default function NotFound() {
  return (
    <div className="relative max-w-7xl mx-auto px-6 pt-32 lg:pt-40 pb-20 lg:pb-32 flex flex-col lg:flex-row items-center gap-16 min-h-[85vh]">
      <div className="w-full lg:w-1/2 text-center lg:text-left z-10">
        <h1 className="text-8xl font-bold tracking-tight gradient-text">404</h1>

        <h2 className="mt-6 text-2xl font-semibold">Page not found</h2>

        <p className="my-3 leading-relaxed">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>

        <p className="mt-10 text-xs text-neutral-400">
          Tip: Check the URL or head back to the homepage.
        </p>
      </div>

      <div className="w-full lg:w-1/2 relative h-[400px] lg:h-[500px] hidden md:block z-10 perspective-1000">
        {/* Card 1 */}
        <div
          className="absolute top-0 right-10 lg:right-0 w-[320px] glass-card p-5 border-white/10 shadow-2xl skew-y-3 -rotate-3 transition-transform duration-700 hover:rotate-0 hover:skew-y-0"
          style={{ transformStyle: "preserve-3d" }}
          data-aos="fade-left"
          data-aos-delay="200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Total Coding
            </div>
            <div className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
              +18%
            </div>
          </div>
          <div className="text-4xl font-extrabold text-white mb-2">42h 15m</div>
          <div className="text-xs text-gray-500 mb-4">Last 7 days</div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-3/4 rounded-full" />
          </div>
        </div>

        {/* Card 2 */}
        <div
          className="absolute top-44 left-10 lg:-left-10 w-[280px] glass-card p-5 border-white/10 shadow-2xl -skew-y-3 rotate-3 z-20 backdrop-blur-xl bg-[#0f0f28]/80 transition-transform duration-700 hover:rotate-0 hover:skew-y-0 text-left"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">
            Top Languages
          </h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#3178c6]/20 flex items-center justify-center text-[#3178c6] font-bold text-xs">
                TS
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-white">TypeScript</span>
                  <span className="text-gray-400 font-mono text-xs">
                    28h 40m
                  </span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3178c6] w-[70%]" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[#61dafb]/20 flex items-center justify-center text-[#61dafb] font-bold text-xs">
                Re
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-white">React</span>
                  <span className="text-gray-400 font-mono text-xs">
                    12h 10m
                  </span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#61dafb] w-[30%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 (Code terminal) */}
        <div
          className="absolute bottom-5 right-20 w-[300px] glass-card p-4 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30 bg-[#050510]/90 transition-transform duration-700 hover:-translate-y-2 text-left"
          data-aos="fade-up"
          data-aos-delay="600"
        >
          <div className="flex gap-1.5 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <div className="font-mono text-[13px] leading-relaxed">
            <span className="text-purple-400">import</span>{" "}
            <span className="text-gray-300">{"{ Pulse }"}</span>{" "}
            <span className="text-purple-400">from</span>{" "}
            <span className="text-green-400">&apos;devpulse&apos;</span>;<br />
            <br />
            <span className="text-blue-400">Pulse</span>.
            <span className="text-yellow-200">syncWakaTime</span>(
            <span className="text-gray-300">key</span>).
            <span className="text-yellow-200">then</span>(
            <span className="text-blue-300">stats</span>{" "}
            <span className="text-purple-400">=&gt;</span> {"{"}
            <br />
            &nbsp;&nbsp;<span className="text-blue-400">console</span>.
            <span className="text-yellow-200">log</span>(
            <span className="text-green-400">&quot;Leveling up!&quot;</span>);
            <br />
            {"}"});
          </div>
        </div>
      </div>
    </div>
  );
}
