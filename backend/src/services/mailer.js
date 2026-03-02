import nodemailer from "nodemailer";

export function createMailer() {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    return null; // ha nincs beállítva, nem küldünk emailt
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
}

export async function sendWelcomeEmail({ to, username }) {
  const transporter = createMailer();
  if (!transporter) return; // nincs email config, skip

  const subject = "Sikeres regisztráció";
  const text = `Üdvözlünk az KovacsFantasy oldalán ${username}!

A regisztráció sikeres volt, mostmár be tudsz jelentkezni a megadott adataiddal a www.kovacsfantasy.com!

Jó szórakozást kiván a KovacsFantasy`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  });
}