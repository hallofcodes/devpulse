import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(
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

  if (!leaderboard) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (leaderboard.owner_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await prisma.leaderboard.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
