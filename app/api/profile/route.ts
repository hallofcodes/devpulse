import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Display name cannot be empty." },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name.trim() },
  });

  return NextResponse.json({ success: true });
}
