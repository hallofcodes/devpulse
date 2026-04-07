import { createClient } from "../../lib/supabase/server";
import Footer from "@/app/components/layout/Footer";
import CTA from "@/app/components/layout/CTA";
import BackButton from "@/app/components/leaderboard/BackButton";
import Image from "next/image";
import { timeAgo } from "@/app/utils/time";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flexes - DevPulse",
  description:
    "Flex your coding projects and share your achievements with the DevPulse community. See what others are working on and get inspired!",
  keywords: [
    "DevPulse",
    "coding flexes",
    "developer projects",
    "coding achievements",
    "programming flexes",
    "open source projects",
    "developer community",
    "coding inspiration",
  ],
  openGraph: {
    title: "Flexes - DevPulse",
    description:
      "Flex your coding projects and share your achievements with the DevPulse community. See what others are working on and get inspired!",
    url: "https://devpulse-waka.vercel.app/flex",
    siteName: "DevPulse",
    images: [
      {
        url: "https://devpulse-waka.vercel.app/images/devpulse.cover.png",
        width: 1200,
        height: 630,
        alt: "DevPulse Cover Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flexes - DevPulse",
    description:
      "Flex your coding projects and share your achievements with the DevPulse community. See what others are working on and get inspired!",
    images: [
      {
        url: "https://devpulse-waka.vercel.app/images/devpulse.cover.png",
        alt: "DevPulse Cover Image",
      },
    ],
  },
};

export default async function Flexs() {
  const supabase = await createClient();

  const [userFlexes, userResult] = await Promise.all([
    supabase
      .from("user_flexes")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  const { data } = userFlexes;
  const { data: user } = userResult;

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white grid-bg relative">
      <div className="max-w-5xl mx-auto p-6 md:p-10 relative z-10">
        <BackButton href="/" />

        <div className="flex justify-center items-center gap-3 mb-8">
          <Image src="/logo.svg" alt="DevPulse Logo" width={36} height={36} />
          <h1 className="text-3xl font-bold text-white">DevPulse Flexes</h1>
        </div>

        {data?.length === 0 && (
          <div className="max-w-5xl mx-auto p-6 md:p-10 relative z-10">
            <h2 className="text-2xl font-bold mb-4">No Flexes Yet</h2>
            <p className="text-gray-400 mb-6">
              Please come back later to see the latest flexes from our
              community.
            </p>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((flex) => (
              <div
                key={flex.id}
                className="glass-card p-6 rounded-xl border border-white/5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold mb-2">
                    {flex.project_name}
                  </h3>
                  <span className="text-sm">{timeAgo(flex.created_at)}</span>
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  {flex.project_time}
                </div>
                <span className="font-bold text-xs text-gray-400">
                  Description:
                </span>
                <p className="text-gray-400 mb-2">{flex.project_description}</p>
                {flex.is_open_source && (
                  <>
                    <span className="font-bold text-xs text-gray-400">
                      Open Source:
                    </span>
                    <a
                      href={flex.open_source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm block underline hover:text-green-300 transition mb-2 truncate"
                    >
                      {flex.open_source_url}
                    </a>
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
                      className="w-4 h-4 text-gray-400 hover:text-gray-300 transition"
                    />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!user && <CTA />}
      <Footer />
    </div>
  );
}
