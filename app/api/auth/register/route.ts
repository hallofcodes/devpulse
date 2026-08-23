import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { recaptcha } from "@/app/lib/recaptcha";
import verifyEmail from "@/app/lib/auth/verify-email";

export async function POST(req: Request) {
  const { email, password, token } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
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
  if (!(await recaptcha(token, "register")))
    throw new Error("reCAPTCHA verification failed. Please try again.");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: email.split("@")[0],
    },
  });
  
  verifyEmail(email);

  return NextResponse.json({ success: true }, { status: 201 });
}
