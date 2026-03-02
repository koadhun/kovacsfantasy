import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/schedule/weeks?season=2025
router.get("/weeks", async (req, res) => {
  const season = Number(req.query.season || 2025);

  const weeks = await prisma.game.findMany({
    where: { season },
    select: { week: true },
    distinct: ["week"],
    orderBy: { week: "asc" }
  });

  res.json({ season, weeks: weeks.map(w => w.week) });
});

// GET /api/schedule/by-week?season=2025&week=1
router.get("/by-week", async (req, res) => {
  const season = Number(req.query.season || 2025);
  const week = Number(req.query.week || 1);

  const games = await prisma.game.findMany({
    where: { season, week },
    orderBy: { kickoffAt: "asc" }
  });

  res.json({ season, week, games });
});

export default router;