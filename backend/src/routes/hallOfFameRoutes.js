import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";

const router = Router();

// GET /api/hall-of-fame
router.get("/", requireAuth, async (req, res) => {
  const entries = await prisma.hallOfFameEntry.findMany({
    orderBy: [{ season: "desc" }, { game: "asc" }, { rank: "asc" }],
  });
  res.json({ entries });
});

// POST /api/hall-of-fame  (create or update, upsert by season+game+rank)
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { season, game, rank, username, points } = req.body || {};

  if (!season || !game || !rank || !username) {
    return res.status(400).json({ error: "Hiányzó mezők (season, game, rank, username kötelező)." });
  }

  if (![1, 2, 3].includes(Number(rank))) {
    return res.status(400).json({ error: "A rank csak 1, 2 vagy 3 lehet." });
  }

  try {
    const entry = await prisma.hallOfFameEntry.upsert({
      where: {
        season_game_rank: {
          season: Number(season),
          game,
          rank: Number(rank),
        },
      },
      update: {
        username,
        points: Number(points) || 0,
      },
      create: {
        season: Number(season),
        game,
        rank: Number(rank),
        username,
        points: Number(points) || 0,
      },
    });

    res.json({ entry });
  } catch (err) {
    console.error("Hall of Fame mentési hiba:", err);
    res.status(500).json({ error: "Nem sikerült menteni a bejegyzést." });
  }
});

// DELETE /api/hall-of-fame/:id
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await prisma.hallOfFameEntry.delete({ where: { id: req.params.id } });
    res.json({ message: "Bejegyzés törölve." });
  } catch (err) {
    res.status(404).json({ error: "Bejegyzés nem található." });
  }
});

export default router;