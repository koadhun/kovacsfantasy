import { sendMail } from "../lib/mailer.js";
import { buildEmailHtml } from "../lib/emailTemplate.js";

export async function sendWelcomeEmail({ to, username }) {
  const subject = "Üdvözlünk a KovacsFantasy oldalán! / Welcome to KovacsFantasy!";

  const loginUrl = `${process.env.FRONTEND_URL || "https://kovacsfantasy.com"}`;

  const text = `Üdvözlünk a KovacsFantasy oldalán, ${username}!

A regisztrációd sikeres volt. Mostantól bejelentkezhetsz a megadott adataiddal, és elkezdheted a szezont a Weekly Pick'Em, a Perfect Challenge és a Playoff Challenge játékmódokban.

Bejelentkezés: ${loginUrl}

Jó szurkolást és sok sikert kívánunk!
A KovacsFantasy csapata

---

Welcome to KovacsFantasy, ${username}!

Your registration was successful. You can now sign in with your details and start the season across Weekly Pick'Em, Perfect Challenge, and Playoff Challenge.

Sign in: ${loginUrl}

Good luck and enjoy the season!
The KovacsFantasy team`;

  const html = buildEmailHtml({
    preheader: "A fiókod elkészült - vágj bele a szezonba. / Your account is ready - let's kick off the season.",
    heading: `Üdvözlünk, ${username}!`,
    bodyHtml: `
      <p style="margin:0 0 14px 0;">A regisztrációd sikeresen megtörtént. Mostantól bejelentkezhetsz a fiókodba, és elkezdheted a szezont mindhárom fantasy játékmódban:</p>
      <ul style="margin:0 0 14px 0; padding-left:20px;">
        <li style="margin-bottom:6px;"><strong>Weekly Pick'Em</strong> - tippeld meg a heti mérkőzések győzteseit</li>
        <li style="margin-bottom:6px;"><strong>Perfect Challenge</strong> - építs heti álomcsapatot</li>
        <li><strong>Playoff Challenge</strong> - gyűjts szorzókat a rájátszásban</li>
      </ul>
      <p style="margin:0 0 22px 0;">Jó szurkolást és sok sikert kívánunk a szezonhoz!</p>

      <hr style="border:none; border-top:1px solid rgba(255,255,255,.10); margin:0 0 22px 0;" />

      <h2 style="margin:0 0 12px 0; font-size:17px; color:#f5f7fb; font-weight:800;">Welcome, ${username}!</h2>
      <p style="margin:0 0 14px 0;">Your registration was successful. You can now sign in to your account and start the season across all three fantasy game modes:</p>
      <ul style="margin:0 0 14px 0; padding-left:20px;">
        <li style="margin-bottom:6px;"><strong>Weekly Pick'Em</strong> - pick the winners of each week's games</li>
        <li style="margin-bottom:6px;"><strong>Perfect Challenge</strong> - build your weekly dream roster</li>
        <li><strong>Playoff Challenge</strong> - stack multipliers through the playoffs</li>
      </ul>
      <p style="margin:0;">Good luck and enjoy the season!</p>
    `,
    buttonLabel: "Bejelentkezés / Sign In",
    buttonUrl: loginUrl,
  });

  await sendMail({ to, subject, text, html });
}