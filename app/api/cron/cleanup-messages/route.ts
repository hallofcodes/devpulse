import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { count } = await prisma.message.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  return NextResponse.json({ deleted: count });
}
