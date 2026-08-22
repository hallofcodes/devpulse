import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const participantRows = await prisma.conversationParticipant.findMany({
    where: { user_id: session.user.id },
    include: {
      conversation: {
        include: {
          participants: {
            select: {
              user_id: true,
              email: true,
              lastSeenAt: true,
              lastReadAt: true,
            },
          },
        },
      },
    },
  });

  const conversations = participantRows.map((row) => ({
    id: row.conversationId,
    type: row.conversation.type.toLowerCase(),
    created_at: row.conversation.createdAt.toISOString(),
    last_read_at: row.lastReadAt.toISOString(),
    users: row.conversation.participants.map((p) => ({
      id: p.userId,
      email: p.email,
      last_seen_at: p.lastSeenAt.toISOString(),
    })),
  }));

  return NextResponse.json(conversations);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { otherUserId, otherUserEmail } = await req.json();

  if (!otherUserId) {
    return NextResponse.json(
      { error: "otherUserId is required." },
      { status: 400 },
    );
  }

  const timestamp = new Date();
  const EPOCH = new Date("1970-01-01T00:00:00.000Z");

  const conversation = await prisma.conversation.create({
    data: {
      type: "PRIVATE",
      participants: {
        create: [
          {
            user_id: session.user.id,
            email: session.user.email,
            lastSeenAt: timestamp,
            lastReadAt: timestamp,
          },
          {
            user_id: otherUserId,
            email: otherUserEmail ?? "",
            lastSeenAt: EPOCH,
            lastReadAt: EPOCH,
          },
        ],
      },
    },
    include: {
      participants: {
        select: { user_id: true, email: true, lastSeenAt: true },
      },
    },
  });

  return NextResponse.json(
    {
      id: conversation.id,
      type: "private",
      created_at: conversation.createdAt.toISOString(),
      last_read_at: timestamp.toISOString(),
      users: conversation.participants.map((p) => ({
        id: p.userId,
        email: p.email,
        last_seen_at: p.lastSeenAt.toISOString(),
      })),
    },
    { status: 201 },
  );
}
