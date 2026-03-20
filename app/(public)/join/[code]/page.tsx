import { Metadata } from "next";
import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ code: string }>;
};

async function getLeaderboard(code: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leaderboards")
    .select("id, name, description, slug, owner_id, created_at")
    .eq("join_code", code)
    .single();
  return data;
}



export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const leaderboard = await getLeaderboard(code);

  if (!leaderboard) {
    return {
      title: "Invite Not Found - DevPulse",
      description: "This invite link is invalid or has expired.",
    };
  }

  const title = `You're invited to join ${leaderboard.name}!`;
  const description =
    leaderboard.description?.length > 0
      ? leaderboard.description
      : `Join the ${leaderboard.name} leaderboard on DevPulse and compete with other developers. Track your coding activity and climb the ranks!`;

  return {
    title: `${title} - DevPulse`,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "DevPulse",
      url: `/join?id=${encodeURIComponent(code)}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params;
  redirect(`/join?id=${encodeURIComponent(code)}`);
}

