import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { recaptcha } from "@/app/lib/recaptcha";

export async function POST(req: Request) {
  const { email, token } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json(
      { error: "reCAPTCHA verification failed. Please try again." },
      { status: 400 },
    );
  }

  // recaptcha verification
  if (!(await recaptcha(token, "forgot_password")))
    throw new Error("reCAPTCHA verification failed. Please try again.");

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ success: true });
  }

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const { token: resetToken } = await prisma.passwordResetToken.create({
    data: { userId: user.id, expiresAt },
    select: { token: true },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

  console.info(`Password reset link for ${email}: ${resetUrl}`);

  return NextResponse.json({ success: true });
}
