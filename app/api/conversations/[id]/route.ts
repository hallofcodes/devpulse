import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversation_id_user_id: { conversation_id: id, user_id: session.user.id },
    },
  });

  if (!participant) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.conversation.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
