import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  calculatePerfectChallengeBreakdown,
  calculatePerfectChallengeScore,
} from "../lib/perfectChallengeScoring.js";

const router = Router();

const DEFAULT_SEASON = 2025;
const DEFAULT_WEEKS = [1, 2, 3];

const SLOT_TO_POSITION = {
  QB: "QB",
  RB1: "RB",
  RB2: "RB",
  WR1: "WR",
  WR2: "WR",
  TE: "TE",
  K: "K",
  DEF: "DEF",
};

const SLOT_ORDER = ["QB", "RB1", "RB2", "WR1", "WR2", "TE", "K", "DEF"];

function roundToOne(value) {
  return Number(Number(value || 0).toFixed(1));
}

function getPlayerScore(player) {
  if (!player) return 0;

  return roundToOne(
    calculatePerfectChallengeScore(player.position, player.weeklyStats || {})
  );
}

function createEmptyOffenseAccumulator() {
  return {
    weeks: new Set(),
    passingYards: 0,
    passingTDs: 0,
    interceptions: 0,
    rushingYards: 0,
    rushingTDs: 0,
    fumbles: 0,
    pointsScored: 0,
    pointsGames: 0,
  };
}

function isOffensiveSkillPosition(position) {
  return ["QB", "RB", "WR", "TE"].includes(position);
}

function getOrCreateTeamAccumulator(map, teamCode) {
  if (!map.has(teamCode)) {
    map.set(teamCode, createEmptyOffenseAccumulator());
  }
  return map.get(teamCode);
}

async function buildOpponentOffenseStatsMap(season, currentWeek) {
  if (currentWeek <= 1) {
    return new Map();
  }

  const previousWeekPlayers = await prisma.perfectChallengePlayer.findMany({
    where: {
      season,
      week: { lt: currentWeek },
      isActive: true,
    },
    orderBy: [{ week: "asc" }, { teamCode: "asc" }, { position: "asc" }],
  });

  const teamMap = new Map();

  for (const player of previousWeekPlayers) {
    if (isOffensiveSkillPosition(player.position)) {
      const acc = getOrCreateTeamAccumulator(teamMap, player.teamCode);
      acc.weeks.add(player.week);

      const weeklyStats = player.weeklyStats || {};

      if (player.position === "QB") {
        acc.passingYards += Number(weeklyStats.passingYards || 0);
        acc.passingTDs += Number(weeklyStats.passingTDs || 0);
        acc.interceptions += Number(weeklyStats.interceptions || 0);
      }

      acc.rushingYards += Number(weeklyStats.rushingYards || 0);
      acc.rushingTDs += Number(weeklyStats.rushingTDs || 0);
      acc.fumbles += Number(
        weeklyStats.fumble != null ? weeklyStats.fumble : weeklyStats.fumbles || 0
      );
    }

    if (player.position === "DEF" && player.currentWeekOpponentTeam) {
      const opponentTeam = player.currentWeekOpponentTeam;
      const acc = getOrCreateTeamAccumulator(teamMap, opponentTeam);
      const allowedPoints = Number(player.weeklyStats?.allowedPoints);

      if (!Number.isNaN(allowedPoints)) {
        acc.pointsScored += allowedPoints;
        acc.pointsGames += 1;
      }
    }
  }

  const result = new Map();

  for (const [teamCode, acc] of teamMap.entries()) {
    const games = acc.weeks.size || 0;

    if (!games) continue;

    result.set(teamCode, {
      passingYards: roundToOne(acc.passingYards / games),
      passingTDs: roundToOne(acc.passingTDs / games),
      interceptions: roundToOne(acc.interceptions / games),
      rushingYards: roundToOne(acc.rushingYards / games),
      rushingTDs: roundToOne(acc.rushingTDs / games),
      fumbles: roundToOne(acc.fumbles / games),
      avgPoints: roundToOne(
        acc.pointsGames > 0 ? acc.pointsScored / acc.pointsGames : 0
      ),
      games,
    });
  }

  return result;
}

function normalizePlayer(player, offenseStatsMap) {
  if (!player) return null;

  const currentScore = getPlayerScore(player);
  const weeklyScoreBreakdown = calculatePerfectChallengeBreakdown(
    player.position,
    player.weeklyStats || {}
  );

  return {
    id: player.id,
    position: player.position,
    teamCode: player.teamCode,
    firstName: player.firstName,
    lastName: player.lastName,
    displayName: player.displayName,
    headshotUrl: player.headshotUrl,
    isDefense: player.isDefense,
    currentScore,
    avgScore: player.avgScore,
    overallStats: player.overallStats,
    weeklyStats: player.weeklyStats,
    weeklyScoreBreakdown,
    lastWeekOpponentTeam: player.lastWeekOpponentTeam,
    opponentDefenseTeamCode: player.opponentDefenseTeamCode,
    currentWeekOpponentTeam: player.currentWeekOpponentTeam,
    currentWeekOpponentDefenseTeamCode: player.currentWeekOpponentDefenseTeamCode,
    allowedPassingYards: player.allowedPassingYards,
    allowedRushingYards: player.allowedRushingYards,
    currentWeekOpponentOffenseStats:
      offenseStatsMap.get(player.currentWeekOpponentTeam) || null,
    week: player.week,
  };
}

function sortByAvgScoreDesc(players) {
  return [...players].sort(
    (a, b) => Number(b.avgScore || 0) - Number(a.avgScore || 0)
  );
}

function sumRosterScoreFromSlots(slots = []) {
  return roundToOne(
    slots.reduce((sum, slot) => sum + getPlayerScore(slot.player), 0)
  );
}

async function ensureUserExists(userId) {
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, role: true },
  });
}

async function getOrCreateRoster(userId, season, week) {
  const existingUser = await ensureUserExists(userId);

  if (!existingUser) {
    const err = new Error("Authenticated user not found in database.");
    err.statusCode = 401;
    throw err;
  }

  let roster = await prisma.perfectChallengeRoster.findUnique({
    where: {
      userId_season_week: {
        userId,
        season,
        week,
      },
    },
    include: {
      slots: {
        include: {
          player: true,
        },
      },
    },
  });

  if (!roster) {
    roster = await prisma.perfectChallengeRoster.create({
      data: { userId, season, week },
      include: {
        slots: {
          include: {
            player: true,
          },
        },
      },
    });
  }

  return roster;
}

async function getSeasonSummary(userId, season) {
  const rosters = await prisma.perfectChallengeRoster.findMany({
    where: { userId, season },
    include: {
      slots: {
        include: {
          player: true,
        },
      },
    },
  });

  const totalPoints = rosters.reduce(
    (sum, roster) => sum + sumRosterScoreFromSlots(roster.slots),
    0
  );

  const selectedSlots = rosters.reduce(
    (sum, roster) => sum + roster.slots.length,
    0
  );

  return {
    totalPoints: roundToOne(totalPoints),
    selectedSlots,
  };
}

router.get("/weeks", requireAuth, async (_req, res) => {
  return res.json({
    season: DEFAULT_SEASON,
    weeks: DEFAULT_WEEKS,
  });
});

router.get("/week", requireAuth, async (req, res) => {
  try {
    const season = Number(req.query.season || DEFAULT_SEASON);
    const week = Number(req.query.week || 1);
    const userId = req.user?.id;

    const roster = await getOrCreateRoster(userId, season, week);

    const pool = await prisma.perfectChallengePlayer.findMany({
      where: {
        season,
        week,
        isActive: true,
      },
      orderBy: [{ position: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
    });

    const offenseStatsMap = await buildOpponentOffenseStatsMap(season, week);

    const slotMap = Object.fromEntries(
      roster.slots.map((slot) => [
        slot.slot,
        normalizePlayer(slot.player, offenseStatsMap),
      ])
    );

    const slots = SLOT_ORDER.map((slotKey) => ({
      slot: slotKey,
      position: SLOT_TO_POSITION[slotKey],
      player: slotMap[slotKey] || null,
      canSwap: true,
    }));

    const normalizedPool = pool.map((player) =>
      normalizePlayer(player, offenseStatsMap)
    );

    const poolByPosition = {
      QB: sortByAvgScoreDesc(normalizedPool.filter((p) => p.position === "QB")),
      RB: sortByAvgScoreDesc(normalizedPool.filter((p) => p.position === "RB")),
      WR: sortByAvgScoreDesc(normalizedPool.filter((p) => p.position === "WR")),
      TE: sortByAvgScoreDesc(normalizedPool.filter((p) => p.position === "TE")),
      K: sortByAvgScoreDesc(normalizedPool.filter((p) => p.position === "K")),
      DEF: sortByAvgScoreDesc(normalizedPool.filter((p) => p.position === "DEF")),
    };

    const weeklyPoints = roundToOne(
      slots.reduce((sum, slot) => sum + Number(slot.player?.currentScore || 0), 0)
    );

    const seasonSummary = await getSeasonSummary(userId, season);

    return res.json({
      season,
      week,
      slots,
      poolByPosition,
      summary: {
        weeklyPoints,
        seasonPoints: seasonSummary.totalPoints,
        selectedCount: slots.filter((slot) => !!slot.player).length,
        seasonSelectedCount: seasonSummary.selectedSlots,
      },
    });
  } catch (error) {
    console.error("GET /api/perfect-challenge/week error:", error);

    if (error.statusCode === 401) {
      return res.status(401).json({
        error:
          "A bejelentkezett felhasználó nem található az adatbázisban. Jelentkezz ki, majd be újra.",
      });
    }

    return res.status(500).json({
      error: "Nem sikerült betölteni a Perfect Challenge heti adatokat.",
    });
  }
});

router.put("/slot", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { season, week, slot, playerId } = req.body || {};

    const existingUser = await ensureUserExists(userId);
    if (!existingUser) {
      return res.status(401).json({
        error:
          "A bejelentkezett felhasználó nem található az adatbázisban. Jelentkezz ki, majd be újra.",
      });
    }

    if (!season || !week || !slot || !playerId) {
      return res.status(400).json({
        error: "A season, week, slot és playerId kötelező.",
      });
    }

    const expectedPosition = SLOT_TO_POSITION[slot];
    if (!expectedPosition) {
      return res.status(400).json({ error: "Érvénytelen slot." });
    }

    const player = await prisma.perfectChallengePlayer.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return res.status(404).json({ error: "Játékos nem található." });
    }

    if (player.season !== Number(season) || player.week !== Number(week)) {
      return res.status(400).json({
        error: "A játékos nem ehhez a szezonhoz / héthez tartozik.",
      });
    }

    if (player.position !== expectedPosition) {
      return res.status(400).json({
        error: `Ehhez a slothoz csak ${expectedPosition} pozíciójú játékos választható.`,
      });
    }

    const roster = await getOrCreateRoster(userId, Number(season), Number(week));

    const duplicate = await prisma.perfectChallengeRosterSlot.findFirst({
      where: {
        rosterId: roster.id,
        playerId,
      },
    });

    if (duplicate && duplicate.slot !== slot) {
      return res.status(400).json({
        error: "Ez a játékos már ki van választva egy másik slotban.",
      });
    }

    await prisma.perfectChallengeRosterSlot.upsert({
      where: {
        rosterId_slot: {
          rosterId: roster.id,
          slot,
        },
      },
      create: {
        rosterId: roster.id,
        slot,
        playerId,
      },
      update: {
        playerId,
      },
    });

    return res.json({ message: "Slot sikeresen frissítve." });
  } catch (error) {
    console.error("PUT /api/perfect-challenge/slot error:", error);
    return res.status(500).json({
      error: "Nem sikerült frissíteni a slotot.",
    });
  }
});

export default router;