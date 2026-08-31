import { Metadata } from "next/types";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;

  const leaderboard = await prisma.leaderboard.findUnique({
    where: { join_code: code },
    select: { name: true, description: true },
  });

  if (!leaderboard) {
    return {
      title: "Invite Not Found - Devpulse",
      description: "This invite link is invalid or has expired.",
      alternates: { canonical: "https://devpulse.hallofcodes.org/join" },
    };
  }

  const title = `You're invited to join ${leaderboard.name}!`;
  const description =
    leaderboard.description && leaderboard.description.length > 0
      ? leaderboard.description
      : `Join the ${leaderboard.name} leaderboard on Devpulse and compete with other developers.`;

  return {
    title: `${title} - Devpulse`,
    description,
    openGraph: { title, description, type: "website", siteName: "Devpulse" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params;
  redirect(`/join?id=${encodeURIComponent(code)}`);
}
