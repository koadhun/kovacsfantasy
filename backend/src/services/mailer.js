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

export async function sendEmailChangedNotice({ to, username, oldEmail, newEmail }) {
  const subject = "Email cím megváltoztatva / Email Address Changed - KovacsFantasy";

  const text = `Szia ${username}!

Az email címed sikeresen megváltozott a KovacsFantasy fiókodban.

Korábbi email cím: ${oldEmail}
Új email cím: ${newEmail}

Ha nem te kezdeményezted ezt a módosítást, kérjük azonnal vedd fel velünk a kapcsolatot.

A KovacsFantasy csapata

---

Hi ${username}!

Your email address has been successfully changed on your KovacsFantasy account.

Previous email: ${oldEmail}
New email: ${newEmail}

If you didn't make this change, please contact us immediately.

The KovacsFantasy team`;

  const html = buildEmailHtml({
    preheader: "Az email címed megváltozott. / Your email address has changed.",
    heading: "Email cím megváltoztatva",
    bodyHtml: `
      <p style="margin:0 0 14px 0;">Szia ${username}!</p>
      <p style="margin:0 0 14px 0;">Az email címed sikeresen megváltozott a KovacsFantasy fiókodban.</p>
      <p style="margin:0 0 4px 0;"><strong>Korábbi email cím:</strong> ${oldEmail}</p>
      <p style="margin:0 0 22px 0;"><strong>Új email cím:</strong> ${newEmail}</p>
      <p style="margin:0 0 22px 0; color:rgba(245,247,251,.6); font-size:13px;">Ha nem te kezdeményezted ezt a módosítást, kérjük azonnal vedd fel velünk a kapcsolatot.</p>

      <hr style="border:none; border-top:1px solid rgba(255,255,255,.10); margin:0 0 22px 0;" />

      <h2 style="margin:0 0 12px 0; font-size:17px; color:#f5f7fb; font-weight:800;">Email Address Changed</h2>
      <p style="margin:0 0 14px 0;">Hi ${username}!</p>
      <p style="margin:0 0 14px 0;">Your email address has been successfully changed on your KovacsFantasy account.</p>
      <p style="margin:0 0 4px 0;"><strong>Previous email:</strong> ${oldEmail}</p>
      <p style="margin:0 0 14px 0;"><strong>New email:</strong> ${newEmail}</p>
      <p style="margin:0; color:rgba(245,247,251,.6); font-size:13px;">If you didn't make this change, please contact us immediately.</p>
    `,
  });

  await Promise.all([
    sendMail({ to: oldEmail, subject, text, html }),
    sendMail({ to: newEmail, subject, text, html }),
  ]);
}

export async function sendPasswordChangedNotice({ to, username }) {
  const subject = "Jelszó megváltoztatva / Password Changed - KovacsFantasy";

  const text = `Szia ${username}!

A jelszavad sikeresen megváltozott a KovacsFantasy fiókodban.

Ha nem te kezdeményezted ezt a módosítást, kérjük azonnal vedd fel velünk a kapcsolatot.

A KovacsFantasy csapata

---

Hi ${username}!

Your password has been successfully changed on your KovacsFantasy account.

If you didn't make this change, please contact us immediately.

The KovacsFantasy team`;

  const html = buildEmailHtml({
    preheader: "A jelszavad megváltozott. / Your password has changed.",
    heading: "Jelszó megváltoztatva",
    bodyHtml: `
      <p style="margin:0 0 14px 0;">Szia ${username}!</p>
      <p style="margin:0 0 22px 0;">A jelszavad sikeresen megváltozott a KovacsFantasy fiókodban.</p>
      <p style="margin:0 0 22px 0; color:rgba(245,247,251,.6); font-size:13px;">Ha nem te kezdeményezted ezt a módosítást, kérjük azonnal vedd fel velünk a kapcsolatot.</p>

      <hr style="border:none; border-top:1px solid rgba(255,255,255,.10); margin:0 0 22px 0;" />

      <h2 style="margin:0 0 12px 0; font-size:17px; color:#f5f7fb; font-weight:800;">Password Changed</h2>
      <p style="margin:0 0 14px 0;">Hi ${username}!</p>
      <p style="margin:0 0 14px 0;">Your password has been successfully changed on your KovacsFantasy account.</p>
      <p style="margin:0; color:rgba(245,247,251,.6); font-size:13px;">If you didn't make this change, please contact us immediately.</p>
    `,
  });

  await sendMail({ to, subject, text, html });
}

export async function sendPasswordResetConfirmedNotice({ to, username }) {
  const subject = "Jelszó sikeresen visszaállítva / Password Successfully Reset - KovacsFantasy";

  const text = `Szia ${username}!

Sikeresen beállítottad az új jelszavadat a KovacsFantasy fiókodhoz a jelszó-visszaállító linken keresztül.

Ha nem te kezdeményezted ezt a módosítást, kérjük azonnal vedd fel velünk a kapcsolatot.

A KovacsFantasy csapata

---

Hi ${username}!

You have successfully set a new password for your KovacsFantasy account via the password reset link.

If you didn't make this change, please contact us immediately.

The KovacsFantasy team`;

  const html = buildEmailHtml({
    preheader: "Az új jelszavad be van állítva. / Your new password is set.",
    heading: "Jelszó sikeresen visszaállítva",
    bodyHtml: `
      <p style="margin:0 0 14px 0;">Szia ${username}!</p>
      <p style="margin:0 0 22px 0;">Sikeresen beállítottad az új jelszavadat a KovacsFantasy fiókodhoz a jelszó-visszaállító linken keresztül.</p>
      <p style="margin:0 0 22px 0; color:rgba(245,247,251,.6); font-size:13px;">Ha nem te kezdeményezted ezt a módosítást, kérjük azonnal vedd fel velünk a kapcsolatot.</p>

      <hr style="border:none; border-top:1px solid rgba(255,255,255,.10); margin:0 0 22px 0;" />

      <h2 style="margin:0 0 12px 0; font-size:17px; color:#f5f7fb; font-weight:800;">Password Successfully Reset</h2>
      <p style="margin:0 0 14px 0;">Hi ${username}!</p>
      <p style="margin:0 0 14px 0;">You have successfully set a new password for your account via the password reset link.</p>
      <p style="margin:0; color:rgba(245,247,251,.6); font-size:13px;">If you didn't make this change, please contact us immediately.</p>
    `,
  });

  await sendMail({ to, subject, text, html });
}