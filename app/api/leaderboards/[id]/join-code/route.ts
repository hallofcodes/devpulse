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
    select: { join_code: true, owner_id: true },
  });

  if (!leaderboard || leaderboard.owner_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json({ join_code: leaderboard.join_code });
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
    select: { owner_id: true },
  });

  if (!leaderboard || leaderboard.owner_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const joinCode = crypto.randomUUID().slice(0, 8);

  await prisma.leaderboard.update({
    where: { id },
    data: { join_code: joinCode },
  });

  return NextResponse.json({ success: true, join_code: joinCode });
}
