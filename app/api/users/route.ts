import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId is required." },
      { status: 400 },
    );
  }

  const participants = await prisma.conversationParticipant.findMany({
    where: {
      conversationId,
      userId: { not: session.user.id },
    },
    select: { userId: true, email: true },
  });

  const users = participants
    .filter((p) => p.email)
    .map((p) => ({ user_id: p.userId, email: p.email }))
    .sort((a, b) => a.email.localeCompare(b.email));

  return NextResponse.json(users);
}
