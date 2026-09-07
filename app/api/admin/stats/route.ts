import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const [topUserStats, threads, messages, leaderboards, flexes] =
    await Promise.all([
      prisma.userStats.findMany({
        select: {
          user_id: true,
          total_seconds: true,
          categories: true,
          user: {
            select: {
              email: true,
              name: true,
              role: true,
              email_verified: true,
              wakatime_api_key: true,
            },
          },
        },
      }),
      prisma.conversation.count(),
      prisma.message.count({ where: { expires_at: { gt: new Date() } } }),
      prisma.leaderboard.count(),
      prisma.userFlex.count({ where: { expires_at: { gt: new Date() } } }),
    ]);

  const users = topUserStats.map((row) => ({
    user_id: row.user_id,
    email: row.user.email,
    name: row.user.name,
    role: row.user.role,
    email_verified: row.user.email_verified ? "Yes" : "No",
    wakatime_api_key: row.user.wakatime_api_key ? "Yes" : "No",
    total_seconds: Number(row.total_seconds),
    categories: row.categories,
  }));

  return NextResponse.json({
    users,
    totalThreads: threads,
    totalMessages: messages,
    totalLeaderboards: leaderboards,
    totalFlexes: flexes,
  });
}
