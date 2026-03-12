import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.json({ user });
  } catch (error) {
    console.error("GET /users/me error:", error);
    return res.status(500).json({ error: "Nem sikerült betölteni a profilt." });
  }
});

router.put("/me", requireAuth, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email kötelező." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingEmail && existingEmail.id !== req.user.id) {
      return res.status(400).json({
        error: "A megadott email cím már használatban van.",
      });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { email: normalizedEmail },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.json({
      message: "Profil frissítve.",
      user: updated,
    });
  } catch (error) {
    console.error("PUT /users/me error:", error);
    return res.status(500).json({ error: "Nem sikerült frissíteni a profilt." });
  }
});

router.put("/me/password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: "A jelenlegi jelszó, az új jelszó és a megerősítés kötelező.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: "Az új jelszó és a megerősítés nem egyezik.",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        error: "Az új jelszónak legalább 6 karakter hosszúnak kell lennie.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Felhasználó nem található." });
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ error: "A jelenlegi jelszó hibás." });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash },
    });

    return res.json({ message: "Jelszó sikeresen módosítva." });
  } catch (error) {
    console.error("PUT /users/me/password error:", error);
    return res.status(500).json({ error: "Nem sikerült módosítani a jelszót." });
  }
});

export default router;