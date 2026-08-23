import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { fetchGameBoxscore } from "../lib/gameBoxscore.js";
import { getCurrentWeek } from "../lib/currentWeek.js";

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

router.get("/current-week", async (req, res) => {
  const season = Number(req.query.season) || new Date().getFullYear();
  const stage = req.query.stage || "REG";

  try {
    const week = await getCurrentWeek(season, stage);
    res.json({ week });
  } catch (err) {
    console.error("current-week hiba:", err);
    res.status(500).json({ error: "Nem sikerült meghatározni az aktuális hetet." });
  }
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

// GET /api/schedule/game/:id
router.get("/game/:id", async (req, res) => {
  try {
    const game = await prisma.game.findUnique({ where: { id: req.params.id } });

    if (!game) {
      return res.status(404).json({ error: "Meccs nem található." });
    }

    if (!game.apiGameId) {
      return res.json({ game, boxscore: null, message: "Ehhez a meccshez nincs részletes statisztika." });
    }

    const boxscore = await fetchGameBoxscore(game.apiGameId);
    res.json({ game, boxscore });
  } catch (err) {
    console.error("Hiba a meccs-részletek lekérésénél:", err);
    res.status(500).json({ error: "Nem sikerült betölteni a meccs statisztikáit." });
  }
});

export default router;