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
  const visibleContributors = contributors.slice(0, 24);
  const spotlightContributors = visibleContributors.slice(0, 3);
  const gridContributors = visibleContributors.slice(3);

  return (
    <section
      className="max-w-5xl mx-auto px-6 pb-8 relative z-10"
      data-aos="fade-up"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Contributors</h2>
          <p className="text-gray-400 text-sm">
            Maintainers, builders, and reviewers powering DevPulse.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-200">
          {contributors.length} community contributors
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {spotlightContributors.map((contributor: Contributor) => (
          <Link
            key={contributor.id}
            href={contributor.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card rounded-2xl border-white/5 bg-white/[0.015] p-4 transition-all hover:bg-white/[0.035] hover:border-indigo-500/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <Image
                src={contributor.avatar_url}
                alt={contributor.login}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="text-sm font-semibold text-white truncate">
                  {contributor.login}
                </p>
                <p className="text-[11px] text-gray-500 uppercase tracking-[0.1em]">
                  Spotlight contributor
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400">View profile →</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {gridContributors.map((contributor: Contributor) => (
          <Link
            key={contributor.id}
            href={contributor.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card flex items-center gap-2.5 rounded-xl border-white/5 bg-white/[0.015] px-3 py-2.5 transition-all hover:bg-white/[0.035] hover:border-indigo-500/20"
          >
            <Image
              src={contributor.avatar_url}
              alt={contributor.login}
              width={26}
              height={26}
              className="rounded-full"
            />
            <span className="text-xs font-medium text-gray-300 truncate">
              {contributor.login}
            </span>
          </Link>
        ))}
      </div>

      {contributors.length > visibleContributors.length && (
        <p className="text-gray-500 text-xs mt-4">
          Showing the top {visibleContributors.length} contributors by public
          activity.
        </p>
      )}

      <div className="h-px w-full mt-8 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
