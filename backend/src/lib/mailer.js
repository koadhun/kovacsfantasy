import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail({ to, subject, text, html }) {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "KovacsFantasy <info@kovacsfantasy.com>",
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });

  if (error) {
    throw new Error(error.message || "Resend email küldési hiba");
  }
}