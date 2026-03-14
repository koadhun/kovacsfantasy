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

function createDefenseAccumulator() {
  return {
    weeks: new Set(),
    allowedPassingYards: 0,
    allowedRushingYards: 0,
    interceptions: 0,
    fumbles: 0,
    sacks: 0,
    returnTDs: 0,
    safety: 0,
    allowedPoints: 0,
  };
}

function createOffenseAccumulator() {
  return {
    weeks: new Set(),
    passingYards: 0,
    passingTDs: 0,
    interceptions: 0,
    rushingYards: 0,
    rushingTDs: 0,
    fumbles: 0,
    pointsScored: 0,
  };
}

function getOrCreateAccumulator(map, teamCode, factory) {
  if (!map.has(teamCode)) {
    map.set(teamCode, factory());
  }
  return map.get(teamCode);
}

async function buildWeeklyAverageMaps(season, currentWeek) {
  if (currentWeek <= 1) {
    return {
      defenseAveragesByTeam: new Map(),
      offenseAveragesByTeam: new Map(),
    };
  }

  const previousWeeksPlayers = await prisma.perfectChallengePlayer.findMany({
    where: {
      season,
      week: { lt: currentWeek },
      isActive: true,
    },
    orderBy: [{ week: "asc" }, { teamCode: "asc" }, { position: "asc" }],
  });

  const defenseMap = new Map();
  const offenseMap = new Map();

  for (const player of previousWeeksPlayers) {
    const weeklyStats = player.weeklyStats || {};

    if (player.position === "DEF") {
      const defenseAcc = getOrCreateAccumulator(
        defenseMap,
        player.teamCode,
        createDefenseAccumulator
      );

      defenseAcc.weeks.add(player.week);
      defenseAcc.allowedPassingYards += Number(player.allowedPassingYards || 0);
      defenseAcc.allowedRushingYards += Number(player.allowedRushingYards || 0);
      defenseAcc.interceptions += Number(
        weeklyStats.interception ?? weeklyStats.interceptions ?? 0
      );
      defenseAcc.fumbles += Number(
        weeklyStats.forcedFumble ?? weeklyStats.forcedFumbles ?? 0
      );
      defenseAcc.sacks += Number(weeklyStats.sack ?? weeklyStats.sacks ?? 0);
      defenseAcc.returnTDs += Number(
        weeklyStats.returnTD ?? weeklyStats.returnTDs ?? 0
      );
      defenseAcc.safety += Number(weeklyStats.safety ?? weeklyStats.safeties ?? 0);
      defenseAcc.allowedPoints += Number(weeklyStats.allowedPoints || 0);

      if (player.currentWeekOpponentTeam) {
        const offenseAcc = getOrCreateAccumulator(
          offenseMap,
          player.currentWeekOpponentTeam,
          createOffenseAccumulator
        );

        offenseAcc.weeks.add(player.week);
        offenseAcc.pointsScored += Number(weeklyStats.allowedPoints || 0);
      }

      continue;
    }

    if (player.position === "QB") {
      const offenseAcc = getOrCreateAccumulator(
        offenseMap,
        player.teamCode,
        createOffenseAccumulator
      );

      offenseAcc.weeks.add(player.week);
      offenseAcc.passingYards += Number(weeklyStats.passingYards || 0);
      offenseAcc.passingTDs += Number(weeklyStats.passingTDs || 0);
      offenseAcc.interceptions += Number(weeklyStats.interceptions || 0);
      offenseAcc.rushingYards += Number(weeklyStats.rushingYards || 0);
      offenseAcc.rushingTDs += Number(weeklyStats.rushingTDs || 0);
      offenseAcc.fumbles += Number(
        weeklyStats.fumble != null ? weeklyStats.fumble : weeklyStats.fumbles || 0
      );

      continue;
    }

    if (player.position === "RB") {
      const offenseAcc = getOrCreateAccumulator(
        offenseMap,
        player.teamCode,
        createOffenseAccumulator
      );

      offenseAcc.weeks.add(player.week);
      offenseAcc.rushingYards += Number(weeklyStats.rushingYards || 0);
      offenseAcc.rushingTDs += Number(weeklyStats.rushingTDs || 0);
      offenseAcc.fumbles += Number(
        weeklyStats.fumble != null ? weeklyStats.fumble : weeklyStats.fumbles || 0
      );

      continue;
    }

    if (player.position === "WR" || player.position === "TE") {
      const offenseAcc = getOrCreateAccumulator(
        offenseMap,
        player.teamCode,
        createOffenseAccumulator
      );

      offenseAcc.weeks.add(player.week);
      offenseAcc.rushingYards += Number(weeklyStats.rushingYards || 0);
      offenseAcc.rushingTDs += Number(weeklyStats.rushingTDs || 0);
      offenseAcc.fumbles += Number(
        weeklyStats.fumble != null ? weeklyStats.fumble : weeklyStats.fumbles || 0
      );
    }
  }

  const defenseAveragesByTeam = new Map();
  for (const [teamCode, acc] of defenseMap.entries()) {
    const games = acc.weeks.size || 0;
    if (!games) continue;

    defenseAveragesByTeam.set(teamCode, {
      allowedPassingYards: roundToOne(acc.allowedPassingYards / games),
      allowedRushingYards: roundToOne(acc.allowedRushingYards / games),
      interceptions: roundToOne(acc.interceptions / games),
      fumbles: roundToOne(acc.fumbles / games),
      sacks: roundToOne(acc.sacks / games),
      returnTDs: roundToOne(acc.returnTDs / games),
      safety: roundToOne(acc.safety / games),
      allowedPoints: roundToOne(acc.allowedPoints / games),
      games,
    });
  }

  const offenseAveragesByTeam = new Map();
  for (const [teamCode, acc] of offenseMap.entries()) {
    const games = acc.weeks.size || 0;
    if (!games) continue;

    offenseAveragesByTeam.set(teamCode, {
      passingYards: roundToOne(acc.passingYards / games),
      passingTDs: roundToOne(acc.passingTDs / games),
      interceptions: roundToOne(acc.interceptions / games),
      rushingYards: roundToOne(acc.rushingYards / games),
      rushingTDs: roundToOne(acc.rushingTDs / games),
      fumbles: roundToOne(acc.fumbles / games),
      avgPoints: roundToOne(acc.pointsScored / games),
      games,
    });
  }

  return {
    defenseAveragesByTeam,
    offenseAveragesByTeam,
  };
}

function normalizePlayer(player, averageMaps) {
  if (!player) return null;

  const currentScore = getPlayerScore(player);
  const weeklyScoreBreakdown = calculatePerfectChallengeBreakdown(
    player.position,
    player.weeklyStats || {}
  );

  const defenseAverages =
    averageMaps.defenseAveragesByTeam.get(
      player.currentWeekOpponentDefenseTeamCode || player.currentWeekOpponentTeam
    ) || null;

  const offenseAverages =
    averageMaps.offenseAveragesByTeam.get(player.currentWeekOpponentTeam) || null;

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
    currentWeekOpponentDefenseStats: defenseAverages,
    currentWeekOpponentOffenseStats: offenseAverages,
    week: player.week,
  };
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

    const averageMaps = await buildWeeklyAverageMaps(season, week);

    const slotMap = Object.fromEntries(
      roster.slots.map((slot) => [
        slot.slot,
        normalizePlayer(slot.player, averageMaps),
      ])
    );

    const slots = SLOT_ORDER.map((slotKey) => ({
      slot: slotKey,
      position: SLOT_TO_POSITION[slotKey],
      player: slotMap[slotKey] || null,
      canSwap: true,
    }));

    const normalizedPool = pool.map((player) =>
      normalizePlayer(player, averageMaps)
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