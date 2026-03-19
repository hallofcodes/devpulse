import Image from "next/image";
import Link from "next/link";

export interface Contributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

export default async function Contributors() {
  const devPulseContributors = await fetch(
    "https://api.github.com/repos/hallofcodes/devpulse/contributors?per_page=100",
  );

  if (!devPulseContributors.ok) {
    throw new Error("Failed to fetch contributors");
  }

  const contributors = await devPulseContributors.json();

  return (
    <section className="max-w-5xl mx-auto px-6 pb-5 relative z-10">
      <div
        className="glass-card border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 rounded-3xl"
        data-aos="fade-up"
      >
        <h2 className="text-2xl font-bold mb-4">Contributors</h2>
        <p className="text-gray-400 text-sm mb-8">
          A big thank you to all the amazing contributors who have helped make
          DevPulse better! Your support and contributions are what drive this
          project forward.
        </p>

        <div className="flex flex-wrap gap-6">
          {contributors.map((contributor: Contributor) => (
            <Link
              key={contributor.id}
              href={contributor.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-2 transition-transform hover:scale-105"
            >
              <Image
                src={contributor.avatar_url}
                alt={contributor.login}
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm text-gray-300">{contributor.login}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
