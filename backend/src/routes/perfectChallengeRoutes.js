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

const TEAM_NAME_TO_CODE = {
  "Arizona Cardinals": "ARI",
  "Atlanta Falcons": "ATL",
  "Baltimore Ravens": "BAL",
  "Buffalo Bills": "BUF",
  "Carolina Panthers": "CAR",
  "Chicago Bears": "CHI",
  "Cincinnati Bengals": "CIN",
  "Cleveland Browns": "CLE",
  "Dallas Cowboys": "DAL",
  "Denver Broncos": "DEN",
  "Detroit Lions": "DET",
  "Green Bay Packers": "GB",
  "Houston Texans": "HOU",
  "Indianapolis Colts": "IND",
  "Jacksonville Jaguars": "JAX",
  "Kansas City Chiefs": "KC",
  "Las Vegas Raiders": "LV",
  "Los Angeles Chargers": "LAC",
  "Los Angeles Rams": "LAR",
  "Miami Dolphins": "MIA",
  "Minnesota Vikings": "MIN",
  "New England Patriots": "NE",
  "New Orleans Saints": "NO",
  "New York Giants": "NYG",
  "New York Jets": "NYJ",
  "Philadelphia Eagles": "PHI",
  "Pittsburgh Steelers": "PIT",
  "San Francisco 49ers": "SF",
  "Seattle Seahawks": "SEA",
  "Tampa Bay Buccaneers": "TB",
  "Tennessee Titans": "TEN",
  "Washington Commanders": "WAS",
};

function roundToOne(value) {
  return Number(Number(value || 0).toFixed(1));
}

function normalizeTeamKey(value) {
  if (!value) return "";
  const trimmed = String(value).trim();
  return TEAM_NAME_TO_CODE[trimmed] || trimmed.toUpperCase();
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
    games: 0,
    allowedPassingYards: 0,
    allowedRushingYards: 0,
    interceptions: 0,
    fumbles: 0,
    sacks: 0,
    returnTDs: 0,
    safeties: 0,
    allowedPoints: 0,
  };
}

function createOffenseAccumulator() {
  return {
    games: 0,
    passingYards: 0,
    passingTDs: 0,
    interceptions: 0,
    rushingYards: 0,
    rushingTDs: 0,
    fumbles: 0,
    points: 0,
  };
}

function getOrCreate(map, key, factory) {
  if (!map.has(key)) {
    map.set(key, factory());
  }
  return map.get(key);
}

async function buildAverageMaps(season, currentWeek) {
  if (currentWeek <= 1) {
    return {
      defenseByTeam: new Map(),
      offenseByTeam: new Map(),
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

  const defenseByTeam = new Map();
  const offenseByTeam = new Map();
  const countedDefenseGames = new Set();
  const countedOffenseGames = new Set();

  for (const player of previousWeeksPlayers) {
    const stats = player.weeklyStats || {};
    const teamCode = normalizeTeamKey(player.teamCode);

    if (player.position === "DEF") {
      const defenseAcc = getOrCreate(
        defenseByTeam,
        teamCode,
        createDefenseAccumulator
      );

      const defenseGameKey = `${teamCode}-${player.week}`;
      if (!countedDefenseGames.has(defenseGameKey)) {
        countedDefenseGames.add(defenseGameKey);
        defenseAcc.games += 1;
        defenseAcc.allowedPassingYards += Number(player.allowedPassingYards || 0);
        defenseAcc.allowedRushingYards += Number(player.allowedRushingYards || 0);
        defenseAcc.interceptions += Number(
          stats.interception ?? stats.interceptions ?? 0
        );
        defenseAcc.fumbles += Number(
          stats.forcedFumble ?? stats.forcedFumbles ?? 0
        );
        defenseAcc.sacks += Number(stats.sack ?? stats.sacks ?? 0);
        defenseAcc.returnTDs += Number(stats.returnTD ?? stats.returnTDs ?? 0);
        defenseAcc.safeties += Number(stats.safety ?? stats.safeties ?? 0);
        defenseAcc.allowedPoints += Number(stats.allowedPoints || 0);
      }

      const opponentKey = normalizeTeamKey(player.currentWeekOpponentTeam);
      if (opponentKey) {
        const offenseAcc = getOrCreate(
          offenseByTeam,
          opponentKey,
          createOffenseAccumulator
        );

        const offenseGameKey = `${opponentKey}-${player.week}`;
        if (!countedOffenseGames.has(offenseGameKey)) {
          countedOffenseGames.add(offenseGameKey);
          offenseAcc.games += 1;
          offenseAcc.points += Number(stats.allowedPoints || 0);
        }
      }

      continue;
    }

    const offenseAcc = getOrCreate(offenseByTeam, teamCode, createOffenseAccumulator);

    if (player.position === "QB") {
      offenseAcc.passingYards += Number(stats.passingYards || 0);
      offenseAcc.passingTDs += Number(stats.passingTDs || 0);
      offenseAcc.interceptions += Number(stats.interceptions || 0);
      offenseAcc.rushingYards += Number(stats.rushingYards || 0);
      offenseAcc.rushingTDs += Number(stats.rushingTDs || 0);
      offenseAcc.fumbles += Number(
        stats.fumble != null ? stats.fumble : stats.fumbles || 0
      );
      continue;
    }

    if (player.position === "RB") {
      offenseAcc.rushingYards += Number(stats.rushingYards || 0);
      offenseAcc.rushingTDs += Number(stats.rushingTDs || 0);
      offenseAcc.fumbles += Number(
        stats.fumble != null ? stats.fumble : stats.fumbles || 0
      );
      continue;
    }

    if (player.position === "WR" || player.position === "TE") {
      offenseAcc.fumbles += Number(
        stats.fumble != null ? stats.fumble : stats.fumbles || 0
      );
    }
  }

  const normalizedDefenseByTeam = new Map();
  for (const [teamCode, acc] of defenseByTeam.entries()) {
    if (!acc.games) continue;

    normalizedDefenseByTeam.set(teamCode, {
      allowedPassingYards: roundToOne(acc.allowedPassingYards / acc.games),
      allowedRushingYards: roundToOne(acc.allowedRushingYards / acc.games),
      interceptions: roundToOne(acc.interceptions / acc.games),
      fumbles: roundToOne(acc.fumbles / acc.games),
      sacks: roundToOne(acc.sacks / acc.games),
      returnTDs: roundToOne(acc.returnTDs / acc.games),
      safety: roundToOne(acc.safeties / acc.games),
      allowedPoints: roundToOne(acc.allowedPoints / acc.games),
    });
  }

  const normalizedOffenseByTeam = new Map();
  for (const [teamCode, acc] of offenseByTeam.entries()) {
    if (!acc.games) continue;

    normalizedOffenseByTeam.set(teamCode, {
      passingYards: roundToOne(acc.passingYards / acc.games),
      passingTDs: roundToOne(acc.passingTDs / acc.games),
      interceptions: roundToOne(acc.interceptions / acc.games),
      rushingYards: roundToOne(acc.rushingYards / acc.games),
      rushingTDs: roundToOne(acc.rushingTDs / acc.games),
      fumbles: roundToOne(acc.fumbles / acc.games),
      avgPoints: roundToOne(acc.points / acc.games),
    });
  }

  return {
    defenseByTeam: normalizedDefenseByTeam,
    offenseByTeam: normalizedOffenseByTeam,
  };
}

function normalizePlayer(player, averageMaps) {
  if (!player) return null;

  const currentScore = getPlayerScore(player);
  const weeklyScoreBreakdown = calculatePerfectChallengeBreakdown(
    player.position,
    player.weeklyStats || {}
  );

  const opponentDefenseKey = normalizeTeamKey(
    player.currentWeekOpponentDefenseTeamCode || player.currentWeekOpponentTeam
  );
  const opponentOffenseKey = normalizeTeamKey(player.currentWeekOpponentTeam);

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
    currentWeekOpponentDefenseStats:
      averageMaps.defenseByTeam.get(opponentDefenseKey) || null,
    currentWeekOpponentOffenseStats:
      averageMaps.offenseByTeam.get(opponentOffenseKey) || null,
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

    const averageMaps = await buildAverageMaps(season, week);

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