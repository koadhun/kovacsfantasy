import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { computePickEmPoints } from "../services/pickemScoring.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

/**
 * DEV helper: idő override
 * .env -> NOW_OVERRIDE=2025-09-01T12:00:00.000Z
 */
function getNow() {
  const raw = process.env.NOW_OVERRIDE;

  if (raw) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }

  return new Date();
}

function buildWinner(game) {
  const isFinal =
    game.status === "FINAL" &&
    game.homeScore != null &&
    game.awayScore != null;

  if (!isFinal) return null;

  if (game.homeScore > game.awayScore) return game.homeTeam;
  if (game.awayScore > game.homeScore) return game.awayTeam;
  return "TIE";
}

/**
 * GET /api/pickem/week?season=2025&week=1
 * - visszaadja a heti meccseket + a bejelentkezett user pickjeit
 */
router.get("/week", requireAuth, async (req, res) => {
  try {
    const season = Number(req.query.season || 2025);
    const week = Number(req.query.week || 1);
    const userId = req.user.id;

    const games = await prisma.game.findMany({
      where: { season, week },
      orderBy: { kickoffAt: "asc" },
    });

    const picks = await prisma.pickEmPick.findMany({
      where: {
        userId,
        gameId: { in: games.map((g) => g.id) },
      },
    });

    const pickMap = Object.fromEntries(
      picks.map((p) => [p.gameId, p.picked])
    );

    const now = getNow();

    const enriched = games.map((g) => {
      const picked = pickMap[g.id] || null;
      const started = new Date(g.kickoffAt) <= now;
      const final =
        g.status === "FINAL" &&
        g.homeScore != null &&
        g.awayScore != null;

      const winner = buildWinner(g);

      let correct = null;
      if (final && picked) {
        correct = winner !== "TIE" ? picked === winner : false;
      }

      return {
        ...g,
        picked,
        canPick: !started,
        started,
        final,
        winner,
        correct,
      };
    });

    return res.json({ season, week, games: enriched, now });
  } catch (error) {
    console.error("GET /api/pickem/week error:", error);
    return res.status(500).json({
      error:
        "Nem sikerült betölteni a Weekly Pick'Em adatokat. Ellenőrizd a Pick'Em Prisma táblákat és a backend logot.",
    });
  }
});

/**
 * POST /api/pickem/pick
 * body: { gameId, picked }
 * - menti / frissíti a picket, csak kickoff előtt engedi
 */
router.post("/pick", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameId, picked } = req.body || {};

    if (!gameId || !picked) {
      return res.status(400).json({
        error: "Hiányzó gameId vagy picked.",
      });
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return res.status(404).json({
        error: "Meccs nem található.",
      });
    }

    const now = getNow();

    if (new Date(game.kickoffAt) <= now) {
      return res.status(400).json({
        error: "A mérkőzés már elkezdődött, nem lehet tippelni.",
      });
    }

    const validTeams = [game.homeTeam, game.awayTeam];
    const pickedUp = String(picked).toUpperCase();

    if (!validTeams.includes(pickedUp)) {
      return res.status(400).json({
        error: "Érvénytelen csapat választás.",
      });
    }

    const saved = await prisma.pickEmPick.upsert({
      where: {
        userId_gameId: { userId, gameId },
      },
      create: {
        userId,
        gameId,
        picked: pickedUp,
      },
      update: {
        picked: pickedUp,
      },
    });

    return res.json({
      message: "Tipp elmentve.",
      pick: saved,
    });
  } catch (error) {
    console.error("POST /api/pickem/pick error:", error);
    return res.status(500).json({
      error: "Nem sikerült elmenteni a picket.",
    });
  }
});

/**
 * Helper: weekly score kiszámítása + cache upsert
 */
async function recomputeWeekScore(season, week, userId) {
  const games = await prisma.game.findMany({
    where: { season, week },
    orderBy: { kickoffAt: "asc" },
  });

  const finalGames = games.filter(
    (g) => g.status === "FINAL" && g.homeScore != null && g.awayScore != null
  );

  const picks = await prisma.pickEmPick.findMany({
    where: {
      userId,
      gameId: { in: games.map((g) => g.id) },
    },
  });

  const pickMap = Object.fromEntries(
    picks.map((p) => [p.gameId, p.picked])
  );

  let correct = 0;

  for (const g of finalGames) {
    const winner = buildWinner(g);
    const picked = pickMap[g.id];

    if (picked && winner !== "TIE" && picked === winner) {
      correct += 1;
    }
  }

  const totalGames = games.length;
  const points = computePickEmPoints(correct, totalGames);

  const row = await prisma.pickEmWeekScore.upsert({
    where: {
      userId_season_week: { userId, season, week },
    },
    create: {
      userId,
      season,
      week,
      correct,
      totalGames,
      points,
      calculatedAt: new Date(),
    },
    update: {
      correct,
      totalGames,
      points,
      calculatedAt: new Date(),
    },
  });

  return row;
}

/**
 * GET /api/pickem/leaderboard?season=2025&week=1
 */
router.get("/leaderboard", requireAuth, async (req, res) => {
  try {
    const season = Number(req.query.season || 2025);
    const week = Number(req.query.week || 1);

    const users = await prisma.user.findMany({
      select: { id: true, username: true },
    });

    await Promise.all(users.map((u) => recomputeWeekScore(season, week, u.id)));

    const weekly = await prisma.pickEmWeekScore.findMany({
      where: { season, week },
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
      orderBy: [{ points: "desc" }, { correct: "desc" }],
    });

    const totalsRaw = await prisma.pickEmWeekScore.groupBy({
      by: ["userId"],
      where: { season },
      _sum: {
        points: true,
        correct: true,
        totalGames: true,
      },
    });

    const userMap = Object.fromEntries(users.map((u) => [u.id, u.username]));

    const totals = totalsRaw
      .map((r) => ({
        userId: r.userId,
        username: userMap[r.userId] || "Unknown",
        points: r._sum.points || 0,
        correct: r._sum.correct || 0,
        totalGames: r._sum.totalGames || 0,
      }))
      .sort((a, b) => b.points - a.points || b.correct - a.correct);

    return res.json({
      season,
      week,
      weekly,
      totals,
    });
  } catch (error) {
    console.error("GET /api/pickem/leaderboard error:", error);
    return res.status(500).json({
      error:
        "Nem sikerült betölteni a leaderboard adatokat. Ellenőrizd a Pick'Em táblákat és a backend logot.",
    });
  }
});

/**
 * GET /api/pickem/user/:userId/picks?season=2025&week=1
 * - kickoff előtt a pick rejtve
 * - kickoff után látszik a pick
 * - FINAL esetén correct is visszajön a frontendnek
 */
router.get("/user/:userId/picks", requireAuth, async (req, res) => {
  try {
    const season = Number(req.query.season || 2025);
    const week = Number(req.query.week || 1);
    const targetUserId = req.params.userId;

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, username: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        error: "Felhasználó nem található.",
      });
    }

    const games = await prisma.game.findMany({
      where: { season, week },
      orderBy: { kickoffAt: "asc" },
    });

    const picks = await prisma.pickEmPick.findMany({
      where: {
        userId: targetUserId,
        gameId: { in: games.map((g) => g.id) },
      },
    });

    const pickMap = Object.fromEntries(
      picks.map((p) => [p.gameId, p.picked])
    );

    const now = getNow();

    const result = games.map((g) => {
      const started = new Date(g.kickoffAt) <= now;
      const final =
        g.status === "FINAL" &&
        g.homeScore != null &&
        g.awayScore != null;

      const winner = buildWinner(g);
      const realPicked = pickMap[g.id] || null;
      const revealedPick = started ? realPicked : null;

      let correct = null;
      if (final && realPicked) {
        correct = winner !== "TIE" ? realPicked === winner : false;
      }

      return {
        id: g.id,
        gameId: g.id,
        kickoffAt: g.kickoffAt,
        homeTeam: g.homeTeam,
        awayTeam: g.awayTeam,
        status: g.status,
        homeScore: g.homeScore,
        awayScore: g.awayScore,
        started,
        final,
        winner,
        picked: revealedPick,
        correct: started ? correct : null,
      };
    });

    return res.json({
      season,
      week,
      user: targetUser,
      picks: result,
      now,
    });
  } catch (error) {
    console.error("GET /api/pickem/user/:userId/picks error:", error);
    return res.status(500).json({
      error: "Nem sikerült betölteni a felhasználó pickjeit.",
    });
  }
});

export default router;