import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { toKebabSlug } from "@/app/utils/slug";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const joinCode = crypto.randomUUID().slice(0, 8);
  const slug = toKebabSlug(name.trim(), "leaderboard");

  try {
    const leaderboard = await prisma.leaderboard.create({
      data: {
        name: name.trim(),
        description: "",
        slug,
        ownerId: session.user.id,
        joinCode,
        isPublic: true,
      },
    });

    await prisma.leaderboardMember.create({
      data: {
        leaderboard_id: leaderboard.id,
        user_id: session.user.id,
        role: "owner",
      },
    });

    return NextResponse.json(
      { joinCode: leaderboard.joinCode },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "A leaderboard with that name already exists." },
      { status: 409 },
    );
  }
}
