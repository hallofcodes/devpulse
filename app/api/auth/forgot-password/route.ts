import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { recaptcha } from "@/app/lib/recaptcha";
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
  if (!(await recaptcha(token, "forgot_password")))
    throw new Error("reCAPTCHA verification failed. Please try again.");

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ success: true });
  }

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  const { token: resetToken } = await prisma.passwordResetToken.create({
    data: { user_id: user.id, expires_at: expiresAt },
    select: { token: true },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

  transporter.sendMail({
    from: `Do Not Reply <${NODE_MAILER_USER}>`,
    to: user.email,
    subject: "Reset your password",
    html: emailTemplate({
      title: "Reset your password",
      bodyHtml: `
        <p>Hi <b>${user.name}</b>,</p>
        <p>We received a request to reset your Devpulse password. Click the button below to choose a new one.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #1a1f2e; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 15px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px;">
          Or copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #4f46e5; word-break: break-all;">${resetUrl}</a>
        </p>
        <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
        <div style="background-color: #f9fafb; border-left: 4px solid #1a1f2e; padding: 14px 18px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px;">
            Have a suggestion or ran into an issue? Please don't hesitate to reach out at
            <a href="https://www.hallofcodes.org" style="color: #4f46e5; text-decoration: none; font-weight: bold;">hallofcodes.org</a>.
            We'd love to hear from you.
          </p>
        </div>
      `,
    }),
  });

  return NextResponse.json({ success: true });
}
