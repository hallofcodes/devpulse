import Link from "next/link";
import Image from "next/image";
import { createClient } from "./lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("leaderboards")
    .select("id, name, slug")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden grid-bg">
      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center relative max-w-6xl mx-auto px-6 pt-28 pb-32 text-center">
        <div className="glow-orb w-[500px] h-[500px] bg-indigo-600/15 top-1/4 left-1/2 -translate-x-1/2" />
        <div className="glow-orb w-[300px] h-[300px] bg-purple-600/10 top-1/3 right-0" />

        <Image
          src="/logo.svg"
          alt="DevPulse Logo"
          width={80}
          height={80}
          className="mb-8 relative z-10"
          data-aos="fade-up"
          priority
        />

        <h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight gradient-text relative z-10"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          DevPulse
        </h1>

        <p
          className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed relative z-10"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          Turn your coding activity into competitive leaderboards. Track
          productivity, motivate your team, and visualize real coding impact
          using WakaTime insights.
        </p>

        <div
          className="mt-10 flex justify-center gap-4 relative z-10"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <Link href="/signup" className="btn-primary px-10 py-4">
            Get Started
          </Link>
          <Link href="/login" className="btn-secondary px-10 py-4">
            Login
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-28 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon="⚡"
          title="Private & Public Boards"
          description="Create private boards for your team or open public leaderboards to compete with the community."
          delay="0"
        />
        <FeatureCard
          icon="📊"
          title="Real-Time Stats"
          description="Sync your WakaTime data automatically and watch your progress climb the leaderboard."
          delay="100"
        />
        <FeatureCard
          icon="👥"
          title="Team Collaboration"
          description="Invite teammates, compare coding activity, and foster a culture of productivity."
          delay="200"
        />
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-8 text-center">
        <div className="glass-card p-12" data-aos="fade-up">
          <h2 className="text-3xl font-bold mb-4 gradient-text">
            Ready to track your coding productivity?
          </h2>
          <p className="text-gray-400 mb-8">
            Join developers and teams competing on DevPulse.
          </p>
          <Link
            href="/signup"
            className="btn-primary inline-block px-8 py-4"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Recent Leaderboards */}
      {data && data.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 mt-4 text-center">
          <div className="glass-card p-10" data-aos="fade-up">
            <h2 className="text-2xl font-bold mb-6 text-white">
              Recently Created Leaderboards
            </h2>
            <div className="space-y-2">
              {data.map((board: { id: string; name: string; slug: string }) => (
                <Link
                  key={board.id}
                  href={`/leaderboard/${board.slug}`}
                  className="stat-card flex justify-between items-center px-5 py-3 group"
                  data-aos="fade-up"
                  data-aos-delay="50"
                >
                  <span className="text-gray-200 font-medium group-hover:text-indigo-400 transition">
                    {board.name}
                  </span>
                  <span className="text-gray-500 text-sm group-hover:text-indigo-400 transition">
                    View →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20 py-10 text-center text-sm text-gray-500">
        <p className="font-medium text-gray-400">
          © {new Date().getFullYear()} DevPulse
        </p>
        <p className="mt-1">
          A creation by{" "}
          <span className="text-indigo-400 font-medium">
            Melvin Jones Repol
          </span>
        </p>
        <p className="mt-1 text-gray-600">
          Open source on{" "}
          <a
            href="https://github.com/mrepol742/devpulse"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 hover:text-indigo-400 underline-offset-4 hover:underline transition"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: string;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div
      className="glass-card p-8 group hover:scale-[1.02]"
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-3 text-indigo-300 group-hover:text-indigo-200 transition">
        {title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
