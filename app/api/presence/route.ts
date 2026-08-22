import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timestamp = new Date();

  await prisma.conversationParticipant.updateMany({
    where: { user_id: session.user.id },
    data: { lastSeenAt: timestamp },
  });

  return NextResponse.json({ success: true });
}
