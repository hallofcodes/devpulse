import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ success: true });
  }

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const { token } = await prisma.passwordResetToken.create({
    data: { userId: user.id, expiresAt },
    select: { token: true },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  console.info(`Password reset link for ${email}: ${resetUrl}`);

  return NextResponse.json({ success: true });
}
