import Link from "next/link";

export default function ContributeCard() {
  return (
    <section className="max-w-5xl mx-auto px-6 pb-5 relative z-10">
      <div
        className="glass-card border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 rounded-3xl"
        data-aos="fade-up"
      >
        <h3 className="text-2xl font-semibold text-white mb-2">
          Wanna contribute?
        </h3>
        <p className="text-gray-400 mb-4">
          We welcome contributions! You can help by adding new features, fixing
          bugs, or improving the project. Just make sure to follow our
          guidelines to avoid conflicts.
        </p>
        <div className="bg-black/40 p-4 rounded-lg text-xs text-gray-300 mb-4 overflow-x-auto">
          <pre>
            {`## Contribution Guidelines

Contributions to devpulse are welcome! Please follow these guidelines:

1. Before modifying any existing design or logic that is already working or in use, **contact us first** to avoid conflicts.
2. You are welcome to contribute new features, bug fixes, or improvements.
3. Check the Issues tab (if available) before starting to avoid duplicate work.
4. Follow the existing code style and conventions.
5. Submit a pull request with a clear description of your changes and the problem it solves.

> ⚠️ Pull requests that modify existing working features without prior discussion may not be merged.

Help us keep the codebase ("Devpulse") clean, stable, and maintainable.`}
          </pre>
        </div>
        <Link
          href="/legal/contribution-guidelines"
          className="inline-block px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-gray-200 transition"
        >
          View Full Contribution Guidelines
        </Link>
      </div>
    </section>
  );
}
