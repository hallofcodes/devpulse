import Footer from "@/app/components/layout/Footer";
import CTA from "@/app/components/common/ui/CTA";
import { timeAgo } from "@/app/utils/time";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { Metadata } from "next/types";
import { prisma } from "@/app/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Flex - Devpulse",
  description:
    "Flex your project to the Devpulse community. Discover what other builders are shipping and get inspired.",
  alternates: {
    canonical: "https://devpulse.hallofcodes.org/flex",
  },
  keywords: [
    "Devpulse",
    "coding flexes",
    "developer projects",
    "coding achievements",
    "programming flexes",
    "open source projects",
    "developer community",
    "coding inspiration",
  ],
  openGraph: {
    title: "Flex - Devpulse",
    description:
      "Flex your project to the Devpulse community. Discover what other builders are shipping and get inspired.",
    url: "https://devpulse.hallofcodes.org/flex",
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
    title: "Flex - Devpulse",
    description:
      "Flex your project to the Devpulse community. Discover what other builders are shipping and get inspired.",
    images: [
      {
        url: "https://devpulse.hallofcodes.org/images/devpulse.cover.png",
        alt: "Devpulse Cover Image",
      },
    ],
  },
};

export default async function FlexPage() {
  const now = new Date();
  const flexes = await prisma.userFlex.findMany({
    where: { expires_at: { gt: now } },
    orderBy: { created_at: "desc" },
  });

  return (
    <>
      <div className="px-6 py-8 flex flex-col gap-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Flex
        </h1>

        {flexes.length === 0 && (
          <div className="max-x-7xl mx-auto p-6 md:p-10 relative z-10">
            <h2 className="text-2xl font-bold mb-4">No Project Flexes Yet</h2>
            <p className="text-gray-500 mb-6">
              Come back later to see what the community is building.
            </p>
          </div>
        )}

        {flexes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flexes.map((flex) => (
              <div
                key={flex.id}
                className="glass-card p-6 rounded-xl border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold mb-2">
                    {flex.project_name}
                  </h3>
                  <span className="text-sm">
                    {timeAgo(flex.created_at.toISOString())}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  {flex.project_time}
                </div>
                <span className="font-bold text-xs text-gray-500">
                  Description:
                </span>
                <p className="text-gray-500 mb-2">{flex.project_description}</p>
                {flex.is_open_source && (
                  <>
                    <span className="font-bold text-xs text-gray-500">
                      Open Source:
                    </span>
                    <Link
                      href={flex.open_source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm block underline hover:text-green-300 transition mb-2 truncate"
                    >
                      {flex.open_source_url}
                    </Link>
                  </>
                )}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Posted by {flex.user_email.split("@")[0]}
                  </p>
                  <a
                    href={flex.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FontAwesomeIcon
                      icon={faExternalLink}
                      className="w-4 h-4 text-gray-500 hover:text-gray-600 transition"
                    />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CTA />
      <Footer />
    </>
  );
}
