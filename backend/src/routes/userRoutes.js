import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, username: true, email: true, role: true, createdAt: true }
  });

  return res.json({ user });
});

router.put("/me", requireAuth, async (req, res) => {
  const { email } = req.body;

  // (egyszerű példa: csak emailt engedünk frissíteni)
  if (!email) return res.status(400).json({ error: "Email kötelező." });

  // ütközés ellenőrzés
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail && existingEmail.id !== req.user.id) {
    return res.status(400).json({ error: "A megadott email cim már használatban van." });
  }

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { email },
    select: { id: true, username: true, email: true, role: true, createdAt: true }
  });

  return res.json({ message: "Profil frissítve.", user: updated });
});

export default router;