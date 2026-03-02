import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";

const router = Router();

// összes user listázása (id, username, email, role)
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });
  return res.json({ users });
});

// szerepkör módosítása (USER <-> ADMIN)
router.patch("/users/:id/role", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !["USER", "ADMIN"].includes(role)) {
    return res.status(400).json({ error: "Érvénytelen role. USER vagy ADMIN lehet." });
  }

  // opcionális: ne tudja saját magát USER-re tenni
  if (id === req.user.id) {
    return res.status(400).json({ error: "Saját szerepkört nem módosíthatsz ezen az oldalon." });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, username: true, email: true, role: true }
  });

  return res.json({ message: "Szerepkör frissítve.", user: updated });
});

// user törlése
router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  // ne törölhesse saját magát (erősen ajánlott)
  if (id === req.user.id) {
    return res.status(400).json({ error: "Saját magadat nem törölheted." });
  }

  await prisma.user.delete({ where: { id } });
  return res.json({ message: "Felhasználó törölve." });
});

export default router;