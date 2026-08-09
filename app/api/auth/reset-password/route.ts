import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Invalid or expired reset link." },
      { status: 400 },
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashed },
    }),
    prisma.passwordResetToken.delete({ where: { token } }),
  ]);

  return NextResponse.json({ success: true });
}
