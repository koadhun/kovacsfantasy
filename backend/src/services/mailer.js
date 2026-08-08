import { sendMail } from "../lib/mailer.js";

export async function sendWelcomeEmail({ to, username }) {
  const subject = "Sikeres regisztráció";
  const text = `Üdvözlünk az KovacsFantasy oldalán ${username}!

A regisztráció sikeres volt, mostmár be tudsz jelentkezni a megadott adataiddal a www.kovacsfantasy.com!

Jó szórakozást kiván a KovacsFantasy`;

  await sendMail({ to, subject, text });
}