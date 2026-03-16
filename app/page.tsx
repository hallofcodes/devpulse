import Link from "next/link";
import Image from "next/image";
import { createClient } from "./lib/supabase/server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faChartLine, faUsers, faArrowRight, faCode, faTrophy, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

export default async function Home() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("leaderboards")
    .select("id, name, slug")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-[#e2e8f0] overflow-hidden grid-bg flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Background Orbs */}
      <div className="fixed top-0 inset-x-0 h-screen pointer-events-none -z-10 overflow-hidden hidden md:block">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px] mix-blend-screen" />
      </div>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-32 pb-24 px-6 text-center z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <Link
            href="https://github.com/mrepol742/devpulse"
            target="_blank"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium mb-8 backdrop-blur-md"
            data-aos="fade-down"
          >
            <FontAwesomeIcon icon={faGithub} className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">Star us on GitHub</span>
            <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 text-gray-500 ml-1" />
          </Link>

          <h1
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white pb-6 leading-[1.05] drop-shadow-sm"
            data-aos="fade-up"
          >
            Gamify your <br className="hidden md:block" />
            <span className="gradient-text">coding ecosystem.</span>
          </h1>

          <p
            className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Transform your WakaTime activity into beautiful, competitive leaderboards. 
            Motivate your team, track your personal growth, and showcase your skills.
          </p>

          <div
            className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 w-full"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <Link href="/signup" className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 group">
              Start Tracking Free
              <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="btn-secondary w-full sm:w-auto text-center">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Bento Box Features */}
      <section className="max-w-6xl mx-auto px-6 py-12 w-full z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
          
          {/* Card 1: Large Span */}
          <div 
            className="bento-card md:col-span-2 md:row-span-2 group flex flex-col justify-between"
            data-aos="fade-up"
            data-aos-delay="0"
          >
            <div className="p-8 pb-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 ring-1 ring-white/5 shadow-inner">
                <FontAwesomeIcon icon={faChartLine} className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Real-Time Activity</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Seamlessly connects with WakaTime to securely pull your daily coding statistics, languages used, and preferred editors without any manual entry.
              </p>
            </div>
            {/* Decorative Mock UI */}
            <div className="mt-8 ml-8 bg-[#0f0f28] rounded-tl-xl border-t border-l border-white/5 p-4 flex-1 overflow-hidden relative opacity-50 group-hover:opacity-100 transition-opacity duration-500">
               <div className="h-4 w-32 bg-white/10 rounded mb-4" />
               <div className="flex items-end gap-2 h-24 mb-4">
                 {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
                   <div key={i} className="w-6 bg-indigo-500/40 rounded-t" style={{ height: `${h}%` }} />
                 ))}
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f28] to-transparent" />
            </div>
          </div>

          {/* Card 2: Top Right */}
          <div 
            className="bento-card md:col-span-2 p-8 group flex flex-col relative overflow-hidden"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full -z-10 group-hover:bg-purple-500/10 transition-colors" />
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 ring-1 ring-white/5 shadow-inner">
              <FontAwesomeIcon icon={faTrophy} className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Public & Private Leagues</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Host private boards for your startup or join massive public leaderboards to see how you stack up against the global community.
            </p>
          </div>

          {/* Card 3: Bottom Middle */}
          <div 
            className="bento-card p-8 group"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 ring-1 ring-white/5 shadow-inner">
              <FontAwesomeIcon icon={faCode} className="w-5 h-5" />
            </div>
            <h3 className="text-md font-bold text-white mb-2">Language Insights</h3>
            <p className="text-gray-400 text-sm">Track which languages and frameworks dominate your week.</p>
          </div>

          {/* Card 4: Bottom Right */}
          <div 
            className="bento-card p-8 group"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 ring-1 ring-white/5 shadow-inner">
              <FontAwesomeIcon icon={faGlobe} className="w-5 h-5" />
            </div>
            <h3 className="text-md font-bold text-white mb-2">OS & Editor Tracking</h3>
            <p className="text-gray-400 text-sm">Visualize your environment preferences across all your devices.</p>
          </div>
        </div>
      </section>

      {/* How It Works Layer */}
      <section className="max-w-5xl mx-auto px-6 py-20 w-full z-10 text-center">
        <h2 className="text-3xl font-bold text-white mb-12" data-aos="fade-up">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Connect", desc: "Link your secure WakaTime API key to your DevPulse profile in seconds." },
            { step: "2", title: "Code", desc: "Write code as you normally would in your favorite IDEs. We handle the sync automatically." },
            { step: "3", title: "Compete", desc: "Create or join leaderboards and watch your stats update alongside your peers." }
          ].map((item, i) => (
            <div key={item.step} className="flex flex-col items-center" data-aos="fade-up" data-aos-delay={i * 100}>
               <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-indigo-300 mb-4 shadow-sm">
                 {item.step}
               </div>
               <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
               <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Leaderboards */}
      {data && data.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-12 w-full z-10">
          <div className="flex items-center justify-between mb-6" data-aos="fade-up">
            <h2 className="text-xl font-bold text-white/90">
              Active Leaderboards
            </h2>
            <Link href="/signup" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Create yours →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {data.map((board: { id: string; name: string; slug: string }, i: number) => (
              <Link
                key={board.id}
                href={`/leaderboard/${board.slug}`}
                className="bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/30 hover:bg-white/[0.04] rounded-xl px-4 py-3 flex items-center justify-between group transition-all"
                data-aos="fade-up"
                data-aos-delay={(i % 4) * 50}
              >
                <span className="text-gray-300 text-sm font-medium truncate pr-2 group-hover:text-white transition-colors">
                  {board.name}
                </span>
                <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 text-gray-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sleek CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 w-full z-10 text-center">
        <div className="bento-card p-10 md:p-14 relative overflow-hidden border-indigo-500/20" data-aos="fade-up">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
          <h2 className="text-3xl font-bold mb-4 text-white relative z-10">
            Ready to track your impact?
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto relative z-10">
            Join developers from around the world competing on DevPulse. Free forever for individuals.
          </p>
          <Link
            href="/signup"
            className="btn-primary inline-flex items-center justify-center gap-2 relative z-10 px-6 py-2.5"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Lean Footer */}
      <footer className="border-t border-white/5 py-8 mt-auto z-10 w-full">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Logo" width={16} height={16} className="opacity-60" />
            <span className="font-medium text-gray-400">© {new Date().getFullYear()} DevPulse</span>
          </div>
          <div className="flex gap-4 items-center">
            <a href="https://github.com/mrepol742/devpulse" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
              GitHub
            </a>
            <span className="text-gray-700">|</span>
            <span className="opacity-70">Made by M.J. Repol</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
