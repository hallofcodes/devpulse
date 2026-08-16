import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { recaptcha } from "@/app/lib/recaptcha";

export async function POST(req: Request) {
  const { reset_token, password, token } = await req.json();

  if (!reset_token || !password) {
    return NextResponse.json(
      { error: "Reset token and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  if (!token) {
    return NextResponse.json(
      { error: "reCAPTCHA verification failed. Please try again." },
      { status: 400 },
    );
  }

  // recaptcha verification
  if (!(await recaptcha(token, "reset_password")))
    throw new Error("reCAPTCHA verification failed. Please try again.");

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: reset_token },
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
    prisma.passwordResetToken.delete({ where: { token: reset_token } }),
  ]);

  return NextResponse.json({ success: true });
}
