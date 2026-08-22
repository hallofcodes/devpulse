import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import crypto from "crypto";
import { transporter } from "@/app/lib/smtp/nodemailer";
import { recaptcha } from "@/app/lib/recaptcha";

const NODE_MAILER_USER = process.env.NODE_MAILER_USER || "";

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
  if (!(await recaptcha(token, "email_verify")))
    throw new Error("reCAPTCHA verification failed. Please try again.");

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ success: true });
  }

  if (user.email_verified) {
    return NextResponse.json({ success: true });
  }

  // Delete any existing verification token for this email before creating a new one
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: { identifier: email, token: verificationToken, expires },
  });

  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`;

  console.info(`Email verification link for ${email}: ${verifyUrl}`);

  transporter.sendMail({
    from: `Do Not Reply <${NODE_MAILER_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <p>Hi <b>${user.name}</b>,</p>
      <p>Please click the link below to verify your email address:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>Regards,</p>
      <p>DevPulse</p>

      <small>This email was sent from DevPulse. If you did not request this, please ignore this email.</small>
    `,
  });

  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/verify-email?error=invalid", req.url),
    );
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    if (record) {
      await prisma.verificationToken.delete({ where: { token } });
    }
    return NextResponse.redirect(
      new URL("/verify-email?error=expired", req.url),
    );
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { email_verified: new Date() },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}
