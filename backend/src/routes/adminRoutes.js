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

    if (!role || !["USER", "ADMIN", "VIP"].includes(role)) {
    return res.status(400).json({ error: "Érvénytelen role. USER, VIP vagy ADMIN lehet." });
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

// Változásnapló: ki, mikor, mit, miről mire módosított a Weekly / Perfect / Playoff játékban.
// GET /api/admin/change-log?game=PICKEM|PERFECT|PLAYOFF&season=2026&week=5&round=WILDCARD&q=felhasznalo&page=1&limit=50
router.get("/change-log", requireAuth, requireAdmin, async (req, res) => {
  try {
    const where = {};

    const game = String(req.query.game || "").toUpperCase();
    if (["PICKEM", "PERFECT", "PLAYOFF"].includes(game)) where.game = game;

    const season = Number(req.query.season);
    if (Number.isInteger(season) && season > 0) where.season = season;

    const week = Number(req.query.week);
    if (req.query.week !== undefined && req.query.week !== "" && Number.isInteger(week)) {
      where.week = week;
    }

    const round = String(req.query.round || "").toUpperCase();
    if (round) where.round = round;

    const q = String(req.query.q || "").trim();
    if (q) where.username = { contains: q, mode: "insensitive" };

    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const page = Math.max(Number(req.query.page) || 1, 1);

    const [entries, total, seasonRows] = await Promise.all([
      prisma.fantasyChangeLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.fantasyChangeLog.count({ where }),
      prisma.fantasyChangeLog.findMany({
        distinct: ["season"],
        select: { season: true },
        orderBy: { season: "desc" },
      }),
    ]);

    return res.json({
      entries,
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      seasons: seasonRows.map((r) => r.season),
    });
  } catch (err) {
    console.error("GET /api/admin/change-log error:", err);
    return res.status(500).json({ error: "Nem sikerült betölteni a változásnaplót." });
  }
});

export default router;