import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  calculatePerfectChallengeBreakdown,
  calculatePerfectChallengeScore,
} from "../lib/perfectChallengeScoring.js";

const router = Router();

const DEFAULT_SEASON = 2025;

const ROUND_ORDER = ["WILDCARD", "DIVISIONAL", "CONFERENCE", "SUPER_BOWL"];

const ROUND_LABELS = {
  WILDCARD: "Wildcard Weekend",
  DIVISIONAL: "Divisional Playoffs",
  CONFERENCE: "Conference Championships",
  SUPER_BOWL: "Super Bowl",
};

const ROUND_GAME_TYPES = {
  WILDCARD: "WC",
  DIVISIONAL: "DIV",
  CONFERENCE: "CONF",
  SUPER_BOWL: "SB",
};

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
  BYE: "BYE",
};

function roundToOne(value) {
  return Number(Number(value || 0).toFixed(1));
}

function getNow() {
  const raw = process.env.NOW_OVERRIDE;
  if (raw) {
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date();
}

function normalizeTeamKey(value) {
  if (!value) return "";
  const trimmed = String(value).trim();
  return TEAM_NAME_TO_CODE[trimmed] || trimmed.toUpperCase();
}

function isValidRound(round) {
  return ROUND_ORDER.includes(round);
}

function getRoundIndex(round) {
  return ROUND_ORDER.indexOf(round);
}

function getActiveRoundsThrough(round) {
  const idx = getRoundIndex(round);
  return idx >= 0 ? ROUND_ORDER.slice(0, idx + 1) : [];
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

async function ensureUserExists(userId) {
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, role: true },
  });
}

async function getOrCreateRoster(userId, season, round) {
  const existingUser = await ensureUserExists(userId);

  if (!existingUser) {
    const err = new Error("Authenticated user not found in database.");
    err.statusCode = 401;
    throw err;
  }

  let roster = await prisma.playoffChallengeRoster.findUnique({
    where: {
      userId_season_round: {
        userId,
        season,
        round,
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
    roster = await prisma.playoffChallengeRoster.create({
      data: { userId, season, round },
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

async function getExistingRoster(userId, season, round) {
  return prisma.playoffChallengeRoster.findUnique({
    where: {
      userId_season_round: {
        userId,
        season,
        round,
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

function isGameStarted(game, now = getNow()) {
  if (!game) return false;
  if (game.status === "FINAL") return true;
  if (game.status === "ONGOING") return true;
  return new Date(game.kickoffAt) <= now;
}

async function getStartedTeamMap(season, round) {
  const gameType = ROUND_GAME_TYPES[round];

  if (!gameType) {
    return new Map();
  }

  const games = await prisma.game.findMany({
    where: {
      season,
      gameType,
    },
    select: {
      kickoffAt: true,
      status: true,
      homeTeam: true,
      awayTeam: true,
    },
  });

  const now = getNow();
  const map = new Map();

  for (const game of games) {
    const started = isGameStarted(game, now);

    map.set(normalizeTeamKey(game.homeTeam), started);
    map.set(normalizeTeamKey(game.awayTeam), started);
  }

  return map;
}

async function buildAverageMaps(season, currentRound) {
  const activeRounds = getActiveRoundsThrough(currentRound);
  const currentIdx = getRoundIndex(currentRound);

  if (currentIdx <= 0) {
    return {
      defenseByTeam: new Map(),
      offenseByTeam: new Map(),
    };
  }

  const previousRounds = activeRounds.slice(0, -1);

  const previousPlayers = await prisma.playoffChallengePlayer.findMany({
    where: {
      season,
      round: { in: previousRounds },
      isActive: true,
    },
    orderBy: [{ teamCode: "asc" }, { position: "asc" }],
  });

  const defenseByTeam = new Map();
  const offenseByTeam = new Map();
  const countedDefenseGames = new Set();
  const countedOffenseGames = new Set();

  for (const player of previousPlayers) {
    const stats = player.weeklyStats || {};
    const teamCode = normalizeTeamKey(player.teamCode);

    if (player.position === "DEF") {
      const defenseAcc = getOrCreate(
        defenseByTeam,
        teamCode,
        createDefenseAccumulator
      );

      const defenseGameKey = `${teamCode}-${player.round}`;
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
      if (opponentKey && opponentKey !== "BYE") {
        const offenseAcc = getOrCreate(
          offenseByTeam,
          opponentKey,
          createOffenseAccumulator
        );

        const offenseGameKey = `${opponentKey}-${player.round}`;
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
    playerKey: player.playerKey,
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
    round: player.round,
  };
}

function buildAppearanceMap(rosters) {
  const map = new Map();

  for (const round of ROUND_ORDER) {
    const roster = rosters.find((item) => item.round === round);

    map.set(
      round,
      new Set(
        (roster?.slots || [])
          .map((slot) => slot.player?.playerKey)
          .filter(Boolean)
      )
    );
  }

  return map;
}

function getMultiplierForPlayer(playerKey, round, appearanceMap) {
  const currentIdx = getRoundIndex(round);
  if (currentIdx === -1 || !playerKey) return 1;

  let multiplier = 1;

  for (let i = currentIdx - 1; i >= 0; i -= 1) {
    const prevRound = ROUND_ORDER[i];
    const selectedPrevRound = appearanceMap.get(prevRound)?.has(playerKey) === true;

    if (!selectedPrevRound) break;
    multiplier += 1;
  }

  return multiplier;
}

function decorateSlotsWithMultipliers(slots, round, appearanceMap) {
  return slots.map((slot) => {
    if (!slot.player) {
      return {
        ...slot,
        multiplier: 1,
        multipliedScore: 0,
      };
    }

    const multiplier = getMultiplierForPlayer(
      slot.player.playerKey,
      round,
      appearanceMap
    );
    const multipliedScore = roundToOne(
      Number(slot.player.currentScore || 0) * multiplier
    );

    return {
      ...slot,
      multiplier,
      multipliedScore,
    };
  });
}

function buildMultiplierDetails(slots) {
  return slots
    .filter((slot) => !!slot.player)
    .map((slot) => ({
      slot: slot.slot,
      playerId: slot.player.id,
      playerKey: slot.player.playerKey,
      displayName:
        slot.player.displayName ||
        `${slot.player.firstName || ""} ${slot.player.lastName || ""}`.trim(),
      multiplier: slot.multiplier || 1,
      baseScore: roundToOne(slot.player.currentScore || 0),
      multipliedScore: roundToOne(slot.multipliedScore || 0),
    }));
}

function computeRoundScore(roster, appearanceMap) {
  if (!roster) return 0;

  return roundToOne(
    (roster.slots || []).reduce((sum, slot) => {
      if (!slot.player) return sum;

      const baseScore = getPlayerScore(slot.player);
      const multiplier = getMultiplierForPlayer(
        slot.player.playerKey,
        roster.round,
        appearanceMap
      );

      return sum + baseScore * multiplier;
    }, 0)
  );
}

function computePlayoffTotal(rosters) {
  const ordered = [...rosters].sort(
    (a, b) => getRoundIndex(a.round) - getRoundIndex(b.round)
  );
  const appearanceMap = buildAppearanceMap(ordered);

  let total = 0;

  for (const roster of ordered) {
    total += computeRoundScore(roster, appearanceMap);
  }

  return roundToOne(total);
}

async function buildRoundStateForUser(userId, season, round, createIfMissing = false) {
  const [averageMaps, pool, roster, previousAndCurrentRosters] = await Promise.all([
    buildAverageMaps(season, round),
    prisma.playoffChallengePlayer.findMany({
      where: {
        season,
        round,
        isActive: true,
      },
      orderBy: [{ position: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
    }),
    createIfMissing
      ? getOrCreateRoster(userId, season, round)
      : getExistingRoster(userId, season, round),
    prisma.playoffChallengeRoster.findMany({
      where: {
        userId,
        season,
        round: { in: getActiveRoundsThrough(round) },
      },
      include: {
        slots: {
          include: {
            player: true,
          },
        },
      },
    }),
  ]);

  const slotMap = Object.fromEntries(
    (roster?.slots || []).map((slot) => [
      slot.slot,
      normalizePlayer(slot.player, averageMaps),
    ])
  );

  const baseSlots = SLOT_ORDER.map((slotKey) => ({
    slot: slotKey,
    position: SLOT_TO_POSITION[slotKey],
    player: slotMap[slotKey] || null,
    canSwap: true,
    hidden: false,
  }));

  const appearanceMap = buildAppearanceMap(previousAndCurrentRosters);
  const slots = decorateSlotsWithMultipliers(baseSlots, round, appearanceMap);

  const normalizedPool = pool.map((player) => normalizePlayer(player, averageMaps));

  const poolByPosition = {
    QB: sortByAvgScoreDesc(normalizedPool.filter((player) => player.position === "QB")),
    RB: sortByAvgScoreDesc(normalizedPool.filter((player) => player.position === "RB")),
    WR: sortByAvgScoreDesc(normalizedPool.filter((player) => player.position === "WR")),
    TE: sortByAvgScoreDesc(normalizedPool.filter((player) => player.position === "TE")),
    K: sortByAvgScoreDesc(normalizedPool.filter((player) => player.position === "K")),
    DEF: sortByAvgScoreDesc(normalizedPool.filter((player) => player.position === "DEF")),
  };

  const roundPoints = roundToOne(
    slots.reduce((sum, slot) => sum + Number(slot.multipliedScore || 0), 0)
  );

  const playoffTotal = computePlayoffTotal(previousAndCurrentRosters);

  return {
    roster,
    slots,
    poolByPosition,
    summary: {
      roundPoints,
      playoffTotal,
      selectedCount: slots.filter((slot) => !!slot.player).length,
    },
    multiplierDetails: buildMultiplierDetails(slots),
  };
}

function maskSlotsForVisibility(slots, startedByTeam) {
  return slots.map((slot) => {
    if (!slot.player) return slot;

    const started = startedByTeam.get(normalizeTeamKey(slot.player.teamCode)) === true;
    if (started) return slot;

    return {
      ...slot,
      hidden: true,
      player: null,
      multiplier: 1,
      multipliedScore: 0,
    };
  });
}

async function getMaskedPlayoffTotal(userId, season, viewedRound) {
  const activeRounds = getActiveRoundsThrough(viewedRound);

  const [rosters, startedMapsEntries] = await Promise.all([
    prisma.playoffChallengeRoster.findMany({
      where: {
        userId,
        season,
        round: { in: activeRounds },
      },
      include: {
        slots: {
          include: {
            player: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    Promise.all(
      activeRounds.map(async (round) => [round, await getStartedTeamMap(season, round)])
    ),
  ]);

  const startedByRound = new Map(startedMapsEntries);
  const appearanceMap = buildAppearanceMap(rosters);

  let total = 0;

  for (const roster of rosters) {
    const startedByTeam = startedByRound.get(roster.round) || new Map();

    for (const slot of roster.slots || []) {
      const teamCode = normalizeTeamKey(slot.player?.teamCode);
      const started = teamCode ? startedByTeam.get(teamCode) === true : false;

      if (!started || !slot.player) continue;

      const baseScore = getPlayerScore(slot.player);
      const multiplier = getMultiplierForPlayer(
        slot.player.playerKey,
        roster.round,
        appearanceMap
      );

      total += baseScore * multiplier;
    }
  }

  return roundToOne(total);
}

function buildRoundLeaderboardRows(users, rosters, round) {
  const byUser = new Map();

  for (const user of users) {
    byUser.set(String(user.id), []);
  }

  for (const roster of rosters) {
    const key = String(roster.userId);
    if (!byUser.has(key)) {
      byUser.set(key, []);
    }
    byUser.get(key).push(roster);
  }

  return users
    .map((user) => {
      const userRosters = (byUser.get(String(user.id)) || []).sort(
        (a, b) => getRoundIndex(a.round) - getRoundIndex(b.round)
      );
      const appearanceMap = buildAppearanceMap(userRosters);
      const currentRoster = userRosters.find((item) => item.round === round);
      const points = computeRoundScore(currentRoster, appearanceMap);
      const selectedCount = currentRoster?.slots?.length || 0;

      return {
        user: {
          id: user.id,
          username: user.username,
        },
        points,
        selectedCount,
        totalSlots: 8,
      };
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.selectedCount - a.selectedCount ||
        a.user.username.localeCompare(b.user.username)
    );
}

function buildPlayoffTotalsLeaderboardRows(users, rosters) {
  const byUser = new Map();

  for (const user of users) {
    byUser.set(String(user.id), []);
  }

  for (const roster of rosters) {
    const key = String(roster.userId);
    if (!byUser.has(key)) {
      byUser.set(key, []);
    }
    byUser.get(key).push(roster);
  }

  return users
    .map((user) => {
      const userRosters = (byUser.get(String(user.id)) || []).sort(
        (a, b) => getRoundIndex(a.round) - getRoundIndex(b.round)
      );

      return {
        userId: user.id,
        username: user.username,
        points: computePlayoffTotal(userRosters),
        selectedCount: userRosters.reduce(
          (sum, roster) => sum + (roster.slots?.length || 0),
          0
        ),
      };
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.selectedCount - a.selectedCount ||
        a.username.localeCompare(b.username)
    );
}

router.get("/rounds", requireAuth, async (_req, res) => {
  return res.json({
    season: DEFAULT_SEASON,
    rounds: ROUND_ORDER.map((value) => ({
      value,
      label: ROUND_LABELS[value],
    })),
  });
});

router.get("/leaderboard", requireAuth, async (req, res) => {
  try {
    const season = Number(req.query.season || DEFAULT_SEASON);
    const round = String(req.query.round || "WILDCARD");

    if (!isValidRound(round)) {
      return res.status(400).json({ error: "Érvénytelen playoff round." });
    }

    const activeRounds = getActiveRoundsThrough(round);

    const [users, rosters] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, username: true },
      }),
      prisma.playoffChallengeRoster.findMany({
        where: {
          season,
          round: { in: activeRounds },
        },
        include: {
          slots: {
            include: {
              player: true,
            },
          },
        },
      }),
    ]);

    const roundRows = buildRoundLeaderboardRows(users, rosters, round);
    const totals = buildPlayoffTotalsLeaderboardRows(users, rosters);

    return res.json({
      season,
      round,
      roundLabel: ROUND_LABELS[round],
      roundRows,
      totals,
    });
  } catch (error) {
    console.error("GET /api/playoff-challenge/leaderboard error:", error);
    return res.status(500).json({
      error: "Nem sikerült betölteni a Playoff Challenge leaderboard adatokat.",
    });
  }
});

router.get("/user/:userId/roster", requireAuth, async (req, res) => {
  try {
    const season = Number(req.query.season || DEFAULT_SEASON);
    const round = String(req.query.round || "WILDCARD");
    const requestedUserId = String(req.params.userId || "");

    if (!isValidRound(round)) {
      return res.status(400).json({ error: "Érvénytelen playoff round." });
    }

    const viewedUser = await ensureUserExists(requestedUserId);
    if (!viewedUser) {
      return res.status(404).json({ error: "Felhasználó nem található." });
    }

    const roundState = await buildRoundStateForUser(
      requestedUserId,
      season,
      round,
      false
    );

    const isOwnRoster = String(requestedUserId) === String(req.user?.id);
    const startedByTeam = await getStartedTeamMap(season, round);

    const visibleSlots = isOwnRoster
      ? roundState.slots
      : maskSlotsForVisibility(roundState.slots, startedByTeam);

    const visibleRoundPoints = roundToOne(
      visibleSlots.reduce((sum, slot) => sum + Number(slot.multipliedScore || 0), 0)
    );

    const playoffTotal = isOwnRoster
      ? roundState.summary.playoffTotal
      : await getMaskedPlayoffTotal(requestedUserId, season, round);

    return res.json({
      season,
      round,
      roundLabel: ROUND_LABELS[round],
      user: {
        id: viewedUser.id,
        username: viewedUser.username,
      },
      slots: visibleSlots,
      summary: {
        roundPoints: visibleRoundPoints,
        playoffTotal,
        selectedCount: visibleSlots.filter((slot) => !!slot.player).length,
      },
      multiplierDetails: buildMultiplierDetails(
        visibleSlots.filter((slot) => !!slot.player)
      ),
    });
  } catch (error) {
    console.error("GET /api/playoff-challenge/user/:userId/roster error:", error);
    return res.status(500).json({
      error: "Nem sikerült betölteni a felhasználó Playoff Challenge rosterét.",
    });
  }
});

router.get("/round", requireAuth, async (req, res) => {
  try {
    const season = Number(req.query.season || DEFAULT_SEASON);
    const round = String(req.query.round || "WILDCARD");
    const userId = req.user?.id;

    if (!isValidRound(round)) {
      return res.status(400).json({ error: "Érvénytelen playoff round." });
    }

    const roundState = await buildRoundStateForUser(userId, season, round, true);

    return res.json({
      season,
      round,
      roundLabel: ROUND_LABELS[round],
      slots: roundState.slots,
      poolByPosition: roundState.poolByPosition,
      summary: roundState.summary,
      multiplierDetails: roundState.multiplierDetails,
    });
  } catch (error) {
    console.error("GET /api/playoff-challenge/round error:", error);

    if (error.statusCode === 401) {
      return res.status(401).json({
        error:
          "A bejelentkezett felhasználó nem található az adatbázisban. Jelentkezz ki, majd be újra.",
      });
    }

    return res.status(500).json({
      error: "Nem sikerült betölteni a Playoff Challenge adatokat.",
    });
  }
});

router.put("/slot", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { season, round, slot, playerId } = req.body || {};

    const existingUser = await ensureUserExists(userId);
    if (!existingUser) {
      return res.status(401).json({
        error:
          "A bejelentkezett felhasználó nem található az adatbázisban. Jelentkezz ki, majd be újra.",
      });
    }

    if (!season || !round || !slot || !playerId) {
      return res.status(400).json({
        error: "A season, round, slot és playerId kötelező.",
      });
    }

    if (!isValidRound(round)) {
      return res.status(400).json({ error: "Érvénytelen playoff round." });
    }

    const expectedPosition = SLOT_TO_POSITION[slot];
    if (!expectedPosition) {
      return res.status(400).json({ error: "Érvénytelen slot." });
    }

    const player = await prisma.playoffChallengePlayer.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return res.status(404).json({ error: "Játékos nem található." });
    }

    if (player.season !== Number(season) || player.round !== round) {
      return res.status(400).json({
        error: "A játékos nem ehhez a szezonhoz / playoff roundhoz tartozik.",
      });
    }

    if (player.position !== expectedPosition) {
      return res.status(400).json({
        error: `Ehhez a slothoz csak ${expectedPosition} pozíciójú játékos választható.`,
      });
    }

    const roster = await getOrCreateRoster(userId, Number(season), round);

    const duplicate = await prisma.playoffChallengeRosterSlot.findFirst({
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

    await prisma.playoffChallengeRosterSlot.upsert({
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

    return res.json({ message: "Playoff slot sikeresen frissítve." });
  } catch (error) {
    console.error("PUT /api/playoff-challenge/slot error:", error);
    return res.status(500).json({
      error: "Nem sikerült frissíteni a playoff slotot.",
    });
  }
});

export default router;