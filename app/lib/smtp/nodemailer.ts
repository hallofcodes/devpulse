import nodemailer from "nodemailer";

export const NODE_MAILER_USER = process.env.NODE_MAILER_USER || "";

const transporter = nodemailer.createTransport({
  host: process.env.NODE_MAILER_HOST || "smtp.gmail.com",
  port: process.env.NODE_MAILER_PORT
    ? parseInt(process.env.NODE_MAILER_PORT)
    : 587,
  secure: process.env.NODE_MAILER_SECURE === "true",
  auth: {
    user: process.env.NODE_MAILER_USER || "",
    pass: process.env.NODE_MAILER_PASS || "",
  },
});

export { transporter };
