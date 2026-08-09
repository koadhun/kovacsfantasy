import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// A frontend "stage" választója -> gameType szűrés
function gameTypeFilter(stage) {
  if (stage === "PRE") return "PRE";
  if (stage === "POST") return { in: ["WC", "DIV", "CONF", "SB"] };
  return "REG"; // alapérték
}

// GET /api/schedule/seasons
router.get("/seasons", async (req, res) => {
  const rows = await prisma.game.findMany({
    select: { season: true },
    distinct: ["season"],
    orderBy: { season: "desc" }
  });
  res.json({ seasons: rows.map((r) => r.season) });
});

// GET /api/schedule/weeks?season=2025&stage=REG
router.get("/weeks", async (req, res) => {
  const season = Number(req.query.season || 2025);
  const stage = req.query.stage || "REG";

  const weeks = await prisma.game.findMany({
    where: { season, gameType: gameTypeFilter(stage) },
    select: { week: true },
    distinct: ["week"],
    orderBy: { week: "asc" }
  });

  res.json({ season, stage, weeks: weeks.map((w) => w.week) });
});

// GET /api/schedule/by-week?season=2025&week=1&stage=REG
router.get("/by-week", async (req, res) => {
  const season = Number(req.query.season || 2025);
  const week = Number(req.query.week || 1);
  const stage = req.query.stage || "REG";

  const games = await prisma.game.findMany({
    where: { season, week, gameType: gameTypeFilter(stage) },
    orderBy: { kickoffAt: "asc" }
  });

  res.json({ season, week, stage, games });
});

export default router;