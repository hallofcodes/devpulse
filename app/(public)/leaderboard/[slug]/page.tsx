import LeaderboardTable, {
  NonNullableMember,
} from "../../../components/leaderboard/LeaderboardTable";
import Footer from "@/app/components/layout/Footer";
import CTA from "@/app/components/common/ui/CTA";
import { notFound } from "next/navigation";
import Banner from "@/app/components/leaderboard/Banner";
import BackButton from "@/app/components/leaderboard/BackButton";
import Image from "next/image";
import InviteFriendsButton from "@/app/components/leaderboard/InviteFriendsButton";
import InternalServerError from "@/app/internal-server-error";
import { prisma } from "@/app/lib/prisma";

export async function generateStaticParams() {
  const leaderboards = await prisma.leaderboard.findMany({
    select: { slug: true },
  });

  return leaderboards.map((item) => ({ slug: item.slug }));
}

export default async function LeaderboardPage(props: {
  params: Promise<{ slug: string }>;
}) {
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
            userStats: {
              select: {
                totalSeconds: true,
                languages: true,
                operatingSystems: true,
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
        user_id: r.userId,
        role: r.role,
        email: r.user.email!,
        total_seconds: Number(r.user.userStats?.totalSeconds ?? 0),
        languages: (r.user.userStats?.languages as { name: string }[]) ?? [],
        operating_systems:
          (r.user.userStats?.operatingSystems as { name: string }[]) ?? [],
        editors: (r.user.userStats?.editors as { name: string }[]) ?? [],
      }));
  } catch {
    return InternalServerError();
  }

  return (
    <div className="min-h-screen  grid-bg relative">
      <div className="w-full max-w-[1600px] mx-auto p-0 sm:p-6 md:p-10 relative z-10">
        <div className="group relative mb-20 sm:mb-24">
          <Banner
            name={leaderboard.name}
            imageUrl="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
          />

          <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-20 pointer-events-none">
            <div className="pointer-events-auto">
              <BackButton />
            </div>
          </div>

          <div className="absolute left-6 right-4 sm:left-8 sm:right-8 -bottom-14 sm:-bottom-16 flex items-end justify-between gap-3 sm:gap-6 z-10">
            <div className="flex items-end gap-3 sm:gap-6 flex-1 min-w-0">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white p-1.5 sm:p-2 shadow-2xl shrink-0">
                <div className="w-full h-full rounded-xl bg-[#121226] border border-gray-200 flex items-center justify-center overflow-hidden relative">
                  <Image
                    src="/logo.svg"
                    alt="Devpulse Logo"
                    width={40}
                    height={40}
                    className="object-contain opacity-80 sm:w-[50px] sm:h-[50px]"
                  />
                </div>
              </div>

              <div className="mb-2 sm:mb-3 max-w-[calc(100%-120px)] sm:max-w-xl">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3 truncate">
                  {leaderboard.name}
                </h1>
                <p className="text-gray-500 mt-1 text-sm sm:text-base font-medium truncate sm:whitespace-normal leading-relaxed">
                  {leaderboard.description && leaderboard.description.length > 0
                    ? leaderboard.description
                    : `Join ${leaderboard.name} to track your coding metrics, compete with fellow developers, and showcase your engineering skills.`}
                </p>
              </div>
            </div>

            <div className="mb-2 sm:mb-3 shrink-0 scale-90 sm:scale-95 origin-bottom-right">
              <InviteFriendsButton
                joinCode={leaderboard.joinCode}
                leaderboardName={leaderboard.name}
              />
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-0">
          <LeaderboardTable members={members} />
        </div>
      </div>

      <CTA />
      <Footer />
    </div>
  );
}
