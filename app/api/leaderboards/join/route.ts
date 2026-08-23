import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { join_code } = await req.json();
  if (!join_code) {
    return NextResponse.json(
      { error: "Join code is required." },
      { status: 400 },
    );
  }

  const leaderboard = await prisma.leaderboard.findUnique({
    where: { join_code },
    select: { id: true, slug: true },
  });

  if (!leaderboard) {
    return NextResponse.json(
      { error: "Invalid invite code." },
      { status: 404 },
    );
  }

  try {
    await prisma.leaderboardMember.create({
      data: {
        leaderboard_id: leaderboard.id,
        user_id: session.user.id,
        role: "member",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "You are already a member of this leaderboard." },
      { status: 409 },
    );
  }

  return NextResponse.json({ success: true, slug: leaderboard.slug });
}
