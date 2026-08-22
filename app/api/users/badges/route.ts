import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const ids = searchParams.getAll("id");

  if (ids.length === 0) {
    return NextResponse.json([]);
  }

  const stats = await prisma.userStats.findMany({
    where: { user_id: { in: ids } },
    select: { user_id: true, totalSeconds: true },
  });

  return NextResponse.json(
    stats.map((s) => ({
      user_id: s.userId,
      total_seconds: Number(s.totalSeconds),
    })),
  );
}
