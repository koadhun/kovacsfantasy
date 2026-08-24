import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { sendMail } from "../lib/mailer.js";
import { buildEmailHtml } from "../lib/emailTemplate.js";
import { sendPasswordResetConfirmedNotice } from "../services/mailer.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// ===============================
// FORGOT PASSWORD
// ===============================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ error: "Email kötelező." });

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        error: "A megadott email címhez nem tartozik regisztráció."
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    const resetLink =
      `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    try {
      await sendMail({
        to: user.email,
        subject: "Jelszó visszaállítási kérelem / Password Reset Request - KovacsFantasy",
        text:
`Szia ${user.username}!

Jelszó-visszaállítást kértél a KovacsFantasy fiókodhoz. Az alábbi linkre kattintva állíthatsz be új jelszót:

${resetLink}

A link 30 percig érvényes. Ha nem te kérted a jelszó visszaállítását, nyugodtan hagyd figyelmen kívül ezt az emailt - a jelszavad nem fog megváltozni.

A KovacsFantasy csapata

---

Hi ${user.username}!

You requested a password reset for your KovacsFantasy account. Click the link below to set a new password:

${resetLink}

This link is valid for 30 minutes. If you didn't request this, you can safely ignore this email - your password will remain unchanged.

The KovacsFantasy team`,
        html: buildEmailHtml({
          preheader: "Kattints a linkre az új jelszó beállításához. / Click the link to set a new password.",
          heading: "Jelszó visszaállítása",
          bodyHtml: `
            <p style="margin:0 0 14px 0;">Szia ${user.username}!</p>
            <p style="margin:0 0 14px 0;">Jelszó-visszaállítást kértél a fiókodhoz. Az alábbi gombra kattintva állíthatsz be új jelszót.</p>
            <p style="margin:0 0 22px 0; color:rgba(245,247,251,.6); font-size:13px;">A link <strong>30 percig</strong> érvényes. Ha nem te kérted, nyugodtan hagyd figyelmen kívül ezt az emailt - a jelszavad változatlan marad.</p>

            <hr style="border:none; border-top:1px solid rgba(255,255,255,.10); margin:0 0 22px 0;" />

            <h2 style="margin:0 0 12px 0; font-size:17px; color:#f5f7fb; font-weight:800;">Password Reset</h2>
            <p style="margin:0 0 14px 0;">Hi ${user.username}!</p>
            <p style="margin:0 0 14px 0;">You requested a password reset for your account. Click the button below to set a new password.</p>
            <p style="margin:0; color:rgba(245,247,251,.6); font-size:13px;">This link is valid for <strong>30 minutes</strong>. If you didn't request this, you can safely ignore this email - your password will remain unchanged.</p>
          `,
          buttonLabel: "Új jelszó beállítása / Set New Password",
          buttonUrl: resetLink,
        }),
      });
    } catch (err) {
      console.error("Nem sikerült a jelszó-visszaállító emailt elküldeni:", err.message);
      return res.status(502).json({ error: "Az email küldése sikertelen volt. Próbáld meg később." });
    }

    res.json({ message: "Jelszó visszaállító email elküldve." });
  } catch (err) {
    console.error("Hiba a forgot-password végpontban:", err);
    res.status(500).json({ error: "Váratlan szerverhiba történt." });
  }
});


// ===============================
// RESET PASSWORD
// ===============================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token)
      return res.status(400).json({ error: "Token hiányzik." });

    if (password !== confirmPassword) {
      return res.status(400).json({
        error:
          "Az új jelszó és a jelszó megerősítése nem egyezik."
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash }
    });

    if (!record || record.expiresAt < new Date() || record.usedAt) {
      return res.status(400).json({
        error: "Érvénytelen vagy lejárt token."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: hashedPassword },
        select: { email: true, username: true },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() }
      })
    ]);

    if (updatedUser) {
      sendPasswordResetConfirmedNotice({
        to: updatedUser.email,
        username: updatedUser.username,
      }).catch((err) =>
        console.error("Nem sikerült a jelszó-visszaállítás értesítőt elküldeni:", err.message)
      );
    }

    res.json({ message: "Jelszó sikeresen frissítve." });
  } catch (err) {
    console.error("Hiba a reset-password végpontban:", err);
    res.status(500).json({ error: "Váratlan szerverhiba történt." });
  }
});

export default router;