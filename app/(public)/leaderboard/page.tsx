import BackButton from "@/app/components/leaderboard/BackButton";
import Footer from "@/app/components/layout/Footer";
import CTA from "@/app/components/common/ui/CTA";
import Image from "next/image";
import { Metadata } from "next/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { prisma } from "@/app/lib/prisma";

export const metadata: Metadata = {
  title: "Leaderboards - Devpulse",
  description:
    "Explore the Devpulse leaderboards and see how you rank against other developers. Check out the top coders and get inspired to climb the ranks!",
  alternates: {
    canonical: "https://devpulse.hallofcodes.org/leaderboard",
  },
  keywords: [
    "Devpulse",
    "developer leaderboards",
    "coding rankings",
    "programming competition",
    "developer stats",
    "coding achievements",
    "programming leaderboards",
    "developer community",
    "coding inspiration",
  ],
  openGraph: {
    title: "Leaderboards - Devpulse",
    description:
      "Explore the Devpulse leaderboards and see how you rank against other developers. Check out the top coders and get inspired to climb the ranks!",
    url: "https://devpulse.hallofcodes.org/leaderboard",
    siteName: "Devpulse",
    images: [
      {
        url: "https://devpulse.hallofcodes.org/images/devpulse.cover.png",
        width: 1200,
        height: 630,
        alt: "Devpulse Cover Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leaderboards - Devpulse",
    description:
      "Explore the Devpulse leaderboards and see how you rank against other developers. Check out the top coders and get inspired to climb the ranks!",
    images: [
      {
        url: "https://devpulse.hallofcodes.org/images/devpulse.cover.png",
        alt: "Devpulse Cover Image",
      },
    ],
  },
};

export default async function Leaderboards() {
  const leaderboards = await prisma.leaderboard.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white grid-bg relative">
      <div className="max-w-5xl mx-auto p-6 md:p-10 relative z-10">
        <BackButton href="/leaderboards" />

        <div className="flex justify-center items-center gap-3 mb-8">
          <Image src="/logo.svg" alt="Devpulse Logo" width={36} height={36} />
          <h1 className="text-3xl font-bold text-white">
            Devpulse Leaderboards
          </h1>
        </div>

        {leaderboards.length === 0 && (
          <div className="max-w-5xl mx-auto p-6 md:p-10 relative z-10">
            <h2 className="text-2xl font-bold mb-4">No Leaderboards Yet</h2>
            <p className="text-gray-400 mb-6">
              Please come back later to see the leaderboards from our community.
            </p>
          </div>
        )}

        {leaderboards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaderboards.map((board, i) => (
              <a
                key={board.id}
                href={`/leaderboard/${board.slug}`}
                className="stat-card flex justify-between items-center px-6 py-4 group bg-black/20 hover:bg-white/5 transition-all border border-white/5 rounded-xl rounded-tl-sm hover:border-indigo-500/30"
                data-aos="fade-up"
                data-aos-delay={(i * 50).toString()}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover:shadow-[0_0_10px_rgba(99,102,241,0.8)] transition-all" />
                  <span className="text-gray-200 font-semibold group-hover:text-white transition">
                    {board.name}
                  </span>
                </div>
                <span className="text-gray-500 text-sm group-hover:text-indigo-400 transition flex items-center gap-2">
                  View{" "}
                  <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      <CTA />
      <Footer />
    </div>
  );
}
