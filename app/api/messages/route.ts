import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { emitter } from "@/app/lib/emitter";

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

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_user_id: { conversationId, user_id: session.user.id },
    },
  });

  if (!participant) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      expires_at: { gt: new Date() },
    },
    orderBy: { created_at: "asc" },
  });

  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      conversation_id: m.conversationId,
      sender_id: m.senderId,
      text: m.text,
      attachments: m.attachments,
      created_at: m.createdAt.toISOString(),
    })),
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, text, attachments } = await req.json();

  if (
    !conversationId ||
    (!text?.trim() && (!attachments || attachments.length === 0))
  ) {
    return NextResponse.json(
      { error: "conversationId and text are required." },
      { status: 400 },
    );
  }

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_user_id: { conversationId, user_id: session.user.id },
    },
  });

  if (!participant) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: session.user.id,
      text: text?.trim() ?? "",
      attachments: attachments ?? [],
    },
  });

  const payload = {
    id: message.id,
    conversation_id: message.conversationId,
    sender_id: message.senderId,
    text: message.text,
    attachments: message.attachments,
    created_at: message.createdAt.toISOString(),
  };

  emitter.emit(`chat:${conversationId}`, { type: "message", data: payload });

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId, user_id: { not: session.user.id } },
    select: { user_id: true },
  });

  for (const p of participants) {
    emitter.emit(`user:${p.userId}`, {
      type: "new_message",
      data: { conversation_id: conversationId, sender_id: session.user.id },
    });
  }

  return NextResponse.json(payload, { status: 201 });
}
