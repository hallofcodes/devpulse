import Link from "next/link";
import { createClient } from "./lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leaderboards")
    .select("id, name, slug")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-black text-white overflow-hidden">
      <section className="min-h-screen flex flex-col items-center justify-center relative max-w-6xl mx-auto px-6 pt-28 pb-32 text-center">
        <div className="absolute inset-0 -z-10 flex justify-center">
          <div className="w-[600px] h-[600px] bg-purple-600/20 blur-[160px] rounded-full" />
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          DevPulse
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          Turn your coding activity into competitive leaderboards. Track
          productivity, motivate your team, and visualize real coding impact
          using WakaTime insights.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/signup"
            className="px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold shadow-xl hover:scale-105 transition"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="px-10 py-4 rounded-xl border border-white/20 hover:bg-white/10 transition"
          >
            Login
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-28 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Feature
          color="text-indigo-400"
          title="Private & Public Boards"
          description="Create private boards for your team or open public leaderboards to compete with the community."
        />

        <Feature
          color="text-purple-400"
          title="Real-Time Stats"
          description="Sync your WakaTime data automatically and watch your progress climb the leaderboard."
        />

        <Feature
          color="text-pink-400"
          title="Team Collaboration"
          description="Invite teammates, compare coding activity, and foster a culture of productivity."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-5 text-center">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Ready to track your coding productivity?
          </h2>

          <p className="text-gray-400 mb-8">
            Join developers and teams competing on DevPulse.
          </p>

          <Link
            href="/signup"
            className="px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold hover:scale-105 transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 text-center">
        <div className="p-12 bg-indigo-500/20 rounded-2xl shadow-md border border-white/10">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Recently Created Leaderboards
          </h2>

          <div className="space-y-3">
            {data?.map((board) => (
              <Link
                key={board.id}
                href={`/leaderboard/${board.slug}`}
                className="bg-white/10 hover:bg-white/20 transition-colors rounded-lg px-6 py-3 text-left flex justify-between items-center"
              >
                <span className="text-white font-medium hover:underline">
                  {board.name}
                </span>
                <span className="text-gray-400 text-sm">View →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 mt-20 py-8 text-center text-sm text-gray-400">
        <p className="font-medium text-gray-300">
          © {new Date().getFullYear()} DevPulse
        </p>

        <p className="mt-1">
          A creation by{" "}
          <span className="text-indigo-400 font-medium">
            Melvin Jones Repol
          </span>
        </p>

        <p className="text-gray-500">
          Open source on{" "}
          <a
            href="https://github.com/mrepol742/devpulse"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline-offset-4 hover:underline transition"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

function Feature({
  title,
  description,
  color,
}: {
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 transition hover:bg-white/10 hover:scale-[1.02]">
      <h3 className={`text-xl font-semibold mb-3 ${color}`}>{title}</h3>

      <p className="text-gray-400">{description}</p>
    </div>
  );
}
