import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { recaptcha } from "@/app/lib/recaptcha";
import verifyEmail from "@/app/lib/auth/verify-email";
import { NODE_MAILER_USER, transporter } from "@/app/lib/smtp/nodemailer";
import emailTemplate from "@/app/lib/smtp/template";

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

  await verifyEmail(email);

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

  const user = await prisma.user.update({
    where: { email: record.identifier },
    data: { email_verified: new Date() },
  });

  await prisma.verificationToken.delete({ where: { token } });

  transporter.sendMail({
    from: `Do Not Reply <${NODE_MAILER_USER}>`,
    to: user.email,
    subject: "Welcome to Devpulse",
    html: emailTemplate({
      title: "Welcome to Devpulse",
      bodyHtml: `
        <p>Hi <b>${user.name}</b>,</p>
        <p>I'm Melvin Jones Repol, founder of Hall of Codes, the team behind Devpulse. Thank you for joining us, we're excited to have you on board.</p>
        <p>Devpulse is built to help you measure and understand your coding pulse, and we're just getting started. Your feedback will play a big part in shaping where we go next.</p>
        <div style="background-color: #f9fafb; border-left: 4px solid #1a1f2e; padding: 14px 18px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px;">
            Have a suggestion or ran into an issue? Please don't hesitate to reach out at
            <a href="https://www.hallofcodes.org" style="color: #4f46e5; text-decoration: none; font-weight: bold;">hallofcodes.org</a>.
            We'd love to hear from you.
          </p>
        </div>
        <p>Welcome aboard, and happy coding!</p>
        <p style="margin-bottom: 0;">Melvin Jones Repol</p>
        <p style="margin-top: 2px; color: #6b7280; font-size: 13px;">Founder, Hall of Codes</p>
      `,
    }),
  });

  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}
