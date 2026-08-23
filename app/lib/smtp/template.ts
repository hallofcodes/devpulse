/**
 * Generates an HTML email template with the given title and body.
 *
 * @param title The title of the email.
 * @param bodyHtml The HTML content of the email body.
 * @returns The HTML email template as a string.
 */
export default function emailTemplate({
  title,
  bodyHtml,
}: {
  title?: string;
  bodyHtml: string;
}) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1a1f2e; padding: 20px 24px;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0; text-align: center; margin-bottom: 5px;">Devpulse</h1>
        <p style="text-align: center; color: #ffffff; margin: 0; font-size: 15px;">Measure your coding pulse.</p>
      </div>
      <div style="padding: 24px; color: #111827; font-size: 15px; line-height: 1.6;">
        ${title ? `<h2 style="font-size: 18px; margin-top: 0;">${title}</h2>` : ""}
        ${bodyHtml}
      </div>
      <div style="padding: 16px 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
        <p style="margin: 0 0 4px;">This email was sent from Devpulse.</p>
        <p style="margin: 0;">© 2026 Devpulse. All rights reserved.</p>
      </div>
    </div>  
  `;
}
