import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;
  const { mark_read } = await req.json();

  const timestamp = new Date();

  const data: { last_seen_at: Date; last_read_at?: Date } = {
    last_seen_at: timestamp,
  };
  if (mark_read) {
    data.last_read_at = timestamp;
  }

  await prisma.conversationParticipant.updateMany({
    where: { conversation_id: conversationId, user_id: session.user.id },
    data,
  });

  return NextResponse.json({ success: true });
}
