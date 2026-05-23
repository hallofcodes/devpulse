import Link from "next/link";

export default function CTA() {
  return (
    <section className="max-w-5xl mx-auto px-6 pb-5 relative z-10">
      <div
        className="glass-card border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 rounded-3xl"
        data-aos="fade-up"
      >
        <h2 className="text-3xl font-bold mb-4 gradient-text">
          Ready to track your coding productivity?
        </h2>
        <p className="text-gray-400 mb-8">
          Join developers and teams competing on Devpulse.
        </p>
        <Link href="/signup" className="btn-primary inline-block px-8 py-4">
          Create Free Account
        </Link>
      </div>
    </section>
  );
}
