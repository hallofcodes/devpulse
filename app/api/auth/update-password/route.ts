import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { password } = await req.json();

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return NextResponse.json({ success: true });
}
