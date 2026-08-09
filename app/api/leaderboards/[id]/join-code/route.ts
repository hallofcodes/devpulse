import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const leaderboard = await prisma.leaderboard.findUnique({
    where: { id },
    select: { joinCode: true, ownerId: true },
  });

  if (!leaderboard || leaderboard.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json({ joinCode: leaderboard.joinCode });
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const leaderboard = await prisma.leaderboard.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!leaderboard || leaderboard.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const joinCode = crypto.randomUUID().slice(0, 8);

  await prisma.leaderboard.update({
    where: { id },
    data: { joinCode },
  });

  return NextResponse.json({ success: true, joinCode });
}
