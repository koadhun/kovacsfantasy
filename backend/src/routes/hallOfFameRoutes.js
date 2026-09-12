import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";

const router = Router();

function validateBody(body) {
  const { season, game, rank, username } = body || {};

  if (!season || !game || !rank || !username) {
    return "Hiányzó mezők (season, game, rank, username kötelező).";
  }

  if (![1, 2, 3].includes(Number(rank))) {
    return "A rank csak 1, 2 vagy 3 lehet.";
  }

  return null;
}

// GET /api/hall-of-fame
router.get("/", requireAuth, async (req, res) => {
  const entries = await prisma.hallOfFameEntry.findMany({
    orderBy: [{ season: "desc" }, { game: "asc" }, { rank: "asc" }, { points: "desc" }],
  });
  res.json({ entries });
});

// POST /api/hall-of-fame  (mindig ÚJ bejegyzést hoz létre - holtverseny esetén
// több sor is tartozhat ugyanahhoz a season+game+rank kombinációhoz)
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { season, game, rank, username, points } = req.body || {};

  const validationError = validateBody(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const entry = await prisma.hallOfFameEntry.create({
      data: {
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

// PUT /api/hall-of-fame/:id  (egy már létező, konkrét bejegyzés szerkesztése)
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { season, game, rank, username, points } = req.body || {};

  const validationError = validateBody(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const entry = await prisma.hallOfFameEntry.update({
      where: { id: req.params.id },
      data: {
        season: Number(season),
        game,
        rank: Number(rank),
        username,
        points: Number(points) || 0,
      },
    });

    res.json({ entry });
  } catch (err) {
    console.error("Hall of Fame frissítési hiba:", err);
    res.status(404).json({ error: "Bejegyzés nem található." });
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