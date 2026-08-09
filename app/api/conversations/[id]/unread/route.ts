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

  const { id: conversationId } = await params;

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: session.user.id },
    },
    select: { lastReadAt: true },
  });

  if (!participant) {
    return NextResponse.json({ count: 0 });
  }

  const count = await prisma.message.count({
    where: {
      conversationId,
      senderId: { not: session.user.id },
      createdAt: { gt: participant.lastReadAt },
      expiresAt: { gt: new Date() },
    },
  });

  return NextResponse.json({ count });
}
