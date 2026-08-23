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
      conversation_id_user_id: {
        conversation_id: conversationId,
        user_id: session.user.id,
      },
    },
    select: { last_read_at: true },
  });

  if (!participant) {
    return NextResponse.json({ count: 0 });
  }

  const count = await prisma.message.count({
    where: {
      conversation_id: conversationId,
      sender_id: { not: session.user.id },
      created_at: { gt: participant.last_read_at },
      expires_at: { gt: new Date() },
    },
  });

  return NextResponse.json({ count });
}
