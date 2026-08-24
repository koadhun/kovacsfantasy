import { sendMail } from "../lib/mailer.js";
import { buildEmailHtml } from "../lib/emailTemplate.js";

export async function sendWelcomeEmail({ to, username }) {
  const subject = "Üdvözlünk a KovacsFantasy oldalán!";

  const loginUrl = `${process.env.FRONTEND_URL || "https://kovacsfantasy.com"}`;

  const text = `Üdvözlünk a KovacsFantasy oldalán, ${username}!

A regisztrációd sikeres volt. Mostantól bejelentkezhetsz a megadott adataiddal, és elkezdheted a szezont a Weekly Pick'Em, a Perfect Challenge és a Playoff Challenge játékmódokban.

Bejelentkezés: ${loginUrl}

Jó szurkolást és sok sikert kívánunk!
A KovacsFantasy csapata`;

  const html = buildEmailHtml({
    preheader: "A fiókod elkészült - vágj bele a szezonba.",
    heading: `Üdvözlünk, ${username}!`,
    bodyHtml: `
      <p style="margin:0 0 14px 0;">A regisztrációd sikeresen megtörtént. Mostantól bejelentkezhetsz a fiókodba, és elkezdheted a szezont a fantasy játékainkban:</p>
      <ul style="margin:0 0 14px 0; padding-left:20px;">
        <li style="margin-bottom:6px;"><strong>Weekly Pick'Em</strong> - tippeld meg a heti mérkőzések győzteseit</li>
        <li style="margin-bottom:6px;"><strong>Perfect Challenge</strong> - építs heti álomcsapatot</li>
        <li><strong>Playoff Challenge</strong> - gyűjts szorzókat a rájátszásban</li>
      </ul>
      <p style="margin:0;">Jó szurkolást és sok sikert kívánunk a szezonhoz!</p>
    `,
    buttonLabel: "Bejelentkezés",
    buttonUrl: loginUrl,
  });

  await sendMail({ to, subject, text, html });
}