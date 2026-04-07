import Link from "next/link";

export default function ContributeCard() {
  const contributionSteps = [
    {
      title: "Align First",
      description:
        "Open an issue or discussion before changing established behavior.",
    },
    {
      title: "Build Focused PRs",
      description:
        "Keep pull requests scoped to one improvement so review stays fast.",
    },
    {
      title: "Ship with Context",
      description:
        "Include problem statement, change summary, and verification details.",
    },
  ];

  return (
    <section
      className="max-w-5xl mx-auto px-6 pt-4 pb-10 relative z-10"
      data-aos="fade-up"
    >
      <p className="text-xs uppercase tracking-[0.16em] text-gray-400/90 font-semibold mb-3">
        Open Source
      </p>
      <h3 className="text-2xl font-semibold text-white mb-2">
        Want to contribute?
      </h3>
      <p className="text-gray-400 mb-4">
        We welcome thoughtful contributions across features, fixes, and
        documentation. A quick review of the contribution flow helps avoid
        collisions and keeps delivery fast for everyone.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {contributionSteps.map((step, i) => (
          <article
            key={step.title}
            className="glass-card rounded-xl border-white/5 bg-white/[0.015] p-4"
          >
            <div className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-white/15 bg-white/5 px-1.5 text-[11px] font-bold text-gray-200 mb-3">
              {i + 1}
            </div>
            <h4 className="text-white font-semibold mb-2">{step.title}</h4>
            <p className="text-sm text-gray-400">{step.description}</p>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/legal/contribution-guidelines"
          className="inline-block px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition"
        >
          View full contribution guidelines
        </Link>
        <Link
          href="https://github.com/hallofcodes/devpulse"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 rounded-lg border border-white/15 text-gray-200 hover:text-white hover:bg-white/5 transition"
        >
          Open project repository
        </Link>
      </div>
    </section>
  );
}
