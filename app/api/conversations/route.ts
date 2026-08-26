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
              last_seen_at: true,
              last_read_at: true,
            },
          },
        },
      },
    },
  });

  const conversations = participantRows.map((row) => ({
    id: row.conversation_id,
    type: row.conversation.type.toLowerCase(),
    created_at: row.conversation.created_at.toISOString(),
    last_read_at: row.last_read_at.toISOString(),
    users: row.conversation.participants.map((p) => ({
      id: p.user_id,
      email: p.email,
      last_seen_at: p.last_seen_at.toISOString(),
    })),
  }));

  return NextResponse.json(conversations);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { other_user_id, other_user_email } = await req.json();

  if (!other_user_id) {
    return NextResponse.json(
      { error: "other_user_id is required." },
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
            last_seen_at: timestamp,
            last_read_at: timestamp,
          },
          {
            user_id: other_user_id,
            email: other_user_email ?? "",
            last_seen_at: EPOCH,
            last_read_at: EPOCH,
          },
        ],
      },
    },
    include: {
      participants: {
        select: { user_id: true, email: true, last_seen_at: true },
      },
    },
  });

  return NextResponse.json(
    {
      id: conversation.id,
      type: "private",
      created_at: conversation.created_at.toISOString(),
      last_read_at: timestamp.toISOString(),
      users: conversation.participants.map((p) => ({
        id: p.user_id,
        email: p.email,
        last_seen_at: p.last_seen_at.toISOString(),
      })),
    },
    { status: 201 },
  );
}
