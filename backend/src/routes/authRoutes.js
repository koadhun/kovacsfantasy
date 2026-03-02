import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { sendMail } from "../lib/mailer.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// ===============================
// FORGOT PASSWORD
// ===============================
router.post("/forgot-password", async (req, res) => {
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

  await sendMail({
    to: user.email,
    subject: "KovacsFantasy - Jelszó visszaállítás",
    text:
`Szia ${user.username}!

Új jelszó beállításához kattints:

${resetLink}

A link 30 percig érvényes.`
  });

  res.json({ message: "Jelszó visszaállító email elküldve." });
});


// ===============================
// RESET PASSWORD
// ===============================
router.post("/reset-password", async (req, res) => {
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

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: hashedPassword }
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() }
    })
  ]);

  res.json({ message: "Jelszó sikeresen frissítve." });
});

export default router;