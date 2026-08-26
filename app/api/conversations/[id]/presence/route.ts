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

  const data: { lastSeenAt: Date; lastReadAt?: Date } = {
    lastSeenAt: timestamp,
  };
  if (mark_read) {
    data.lastReadAt = timestamp;
  }

  await prisma.conversationParticipant.updateMany({
    where: { conversation_id: conversationId, user_id: session.user.id },
    data,
  });

  return NextResponse.json({ success: true });
}
