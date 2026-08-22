import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { emitter } from "@/app/lib/emitter";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await params;

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_user_id: { conversationId, user_id: session.user.id },
    },
  });

  if (!participant) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { is_typing } = await req.json();

  emitter.emit(`chat:${conversationId}`, {
    type: "typing",
    data: {
      conversation_id: conversationId,
      user_id: session.user.id,
      email: participant.email,
      is_typing: Boolean(is_typing),
    },
  });

  return NextResponse.json({ success: true });
}
