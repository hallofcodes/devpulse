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
      conversation_id_user_id: {
        conversation_id: conversationId,
        user_id: session.user.id,
      },
    },
  });

  if (!participant) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: {
      conversation_id: conversationId,
      expires_at: { gt: new Date() },
    },
    orderBy: { created_at: "asc" },
  });

  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      text: m.text,
      attachments: m.attachments,
      created_at: m.created_at.toISOString(),
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
      conversation_id_user_id: {
        conversation_id: conversationId,
        user_id: session.user.id,
      },
    },
  });

  if (!participant) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      conversation_id: conversationId,
      sender_id: session.user.id,
      text: text?.trim() ?? "",
      attachments: attachments ?? [],
    },
  });

  const payload = {
    id: message.id,
    conversation_id: message.conversation_id,
    sender_id: message.sender_id,
    text: message.text,
    attachments: message.attachments,
    created_at: message.created_at.toISOString(),
  };

  emitter.emit(`chat:${conversationId}`, { type: "message", data: payload });

  const participants = await prisma.conversationParticipant.findMany({
    where: {
      conversation_id: conversationId,
      user_id: { not: session.user.id },
    },
    select: { user_id: true },
  });

  for (const p of participants) {
    emitter.emit(`user:${p.user_id}`, {
      type: "new_message",
      data: { conversation_id: conversationId, sender_id: session.user.id },
    });
  }

  return NextResponse.json(payload, { status: 201 });
}
