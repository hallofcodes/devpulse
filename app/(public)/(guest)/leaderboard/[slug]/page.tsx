import LeaderboardTable, {
  NonNullableMember,
} from "../../../../components/leaderboard/LeaderboardTable";
import Footer from "@/app/components/layout/Footer";
import CTA from "@/app/components/common/ui/CTA";
import { notFound } from "next/navigation";
import InviteFriendsButton from "@/app/components/leaderboard/InviteFriendsButton";
import InternalServerError from "@/app/internal-server-error";
import { prisma } from "@/app/lib/prisma";
import LeaderboardStats from "@/app/components/leaderboard/LeaderboardStats";
import { getCurrentUser } from "@/app/lib/auth/user";

export async function generateStaticParams() {
  const leaderboards = await prisma.leaderboard.findMany({
    select: { slug: true },
  });

  return leaderboards.map((item) => ({ slug: item.slug }));
}

export default async function LeaderboardPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { user } = await getCurrentUser();
  const { slug } = await props.params;

  const leaderboard = await prisma.leaderboard.findUnique({
    where: { slug },
  });

  if (!leaderboard) return notFound();

  let members: NonNullableMember[] = [];
  try {
    const rows = await prisma.leaderboardMember.findMany({
      where: { leaderboard_id: leaderboard.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            user_stats: {
              select: {
                total_seconds: true,
                languages: true,
                operating_systems: true,
                editors: true,
              },
            },
          },
        },
      },
    });

    members = rows
      .filter((r) => r.user.email)
      .map((r) => ({
        user_id: r.user.id,
        role: r.role,
        email: r.user.email!,
        total_seconds: Number(r.user.user_stats?.total_seconds ?? 0),
        languages: (r.user.user_stats?.languages as { name: string }[]) ?? [],
        operating_systems:
          (r.user.user_stats?.operating_systems as { name: string }[]) ?? [],
        editors: (r.user.user_stats?.editors as { name: string }[]) ?? [],
      }));
  } catch {
    return InternalServerError();
  }

  return (
    <>
      <div className="px-6 py-8 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              {leaderboard.name}
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base font-medium">
              Join {leaderboard.name} to track your coding metrics, compete with
              fellow developers, and showcase your engineering skills.
            </p>
          </div>

          {user && (
            <InviteFriendsButton
              joinCode={leaderboard.join_code}
              leaderboardName={leaderboard.name}
            />
          )}
        </div>

        <LeaderboardStats members={members} />
        <LeaderboardTable members={members} />
      </div>

      <CTA />
      <Footer />
    </>
  );
}
