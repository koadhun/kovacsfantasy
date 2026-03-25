import { calculatePerfectChallengeScore } from "../lib/perfectChallengeScoring.js";

const ROUND_WEEK = {
  WILDCARD: 19,
  DIVISIONAL: 20,
  CONFERENCE: 21,
  SUPER_BOWL: 22,
};

const ROUND_GAME_TYPE = {
  WILDCARD: "WC",
  DIVISIONAL: "DIV",
  CONFERENCE: "CONF",
  SUPER_BOWL: "SB",
};

const TEAM_INFO = {
  KC: {
    code: "KC",
    name: "Kansas City Chiefs",
    label: "Chiefs",
    offense: 1.28,
    rush: 1.05,
    defense: 1.18,
  },
  DET: {
    code: "DET",
    name: "Detroit Lions",
    label: "Lions",
    offense: 1.24,
    rush: 1.12,
    defense: 1.12,
  },
  BUF: {
    code: "BUF",
    name: "Buffalo Bills",
    label: "Bills",
    offense: 1.18,
    rush: 1.02,
    defense: 1.1,
  },
  PIT: {
    code: "PIT",
    name: "Pittsburgh Steelers",
    label: "Steelers",
    offense: 0.92,
    rush: 0.98,
    defense: 1.04,
  },
  BAL: {
    code: "BAL",
    name: "Baltimore Ravens",
    label: "Ravens",
    offense: 1.22,
    rush: 1.18,
    defense: 1.16,
  },
  LAC: {
    code: "LAC",
    name: "Los Angeles Chargers",
    label: "Chargers",
    offense: 1.0,
    rush: 0.94,
    defense: 0.98,
  },
  HOU: {
    code: "HOU",
    name: "Houston Texans",
    label: "Texans",
    offense: 1.02,
    rush: 0.96,
    defense: 1.0,
  },
  CIN: {
    code: "CIN",
    name: "Cincinnati Bengals",
    label: "Bengals",
    offense: 1.08,
    rush: 0.92,
    defense: 0.94,
  },
  PHI: {
    code: "PHI",
    name: "Philadelphia Eagles",
    label: "Eagles",
    offense: 1.14,
    rush: 1.08,
    defense: 1.08,
  },
  GB: {
    code: "GB",
    name: "Green Bay Packers",
    label: "Packers",
    offense: 1.0,
    rush: 0.98,
    defense: 0.96,
  },
  TB: {
    code: "TB",
    name: "Tampa Bay Buccaneers",
    label: "Buccaneers",
    offense: 1.04,
    rush: 0.94,
    defense: 1.0,
  },
  MIN: {
    code: "MIN",
    name: "Minnesota Vikings",
    label: "Vikings",
    offense: 0.98,
    rush: 0.9,
    defense: 0.94,
  },
  LAR: {
    code: "LAR",
    name: "Los Angeles Rams",
    label: "Rams",
    offense: 1.06,
    rush: 0.98,
    defense: 1.02,
  },
  WAS: {
    code: "WAS",
    name: "Washington Commanders",
    label: "Commanders",
    offense: 0.96,
    rush: 0.92,
    defense: 0.92,
  },
};

const ROUND_GAMES = [
  {
    key: "WC-1",
    round: "WILDCARD",
    homeCode: "BUF",
    awayCode: "PIT",
    kickoffAt: "2026-01-10T18:00:00.000Z",
  },
  {
    key: "WC-2",
    round: "WILDCARD",
    homeCode: "BAL",
    awayCode: "LAC",
    kickoffAt: "2026-01-10T22:30:00.000Z",
  },
  {
    key: "WC-3",
    round: "WILDCARD",
    homeCode: "HOU",
    awayCode: "CIN",
    kickoffAt: "2026-01-11T18:00:00.000Z",
  },
  {
    key: "WC-4",
    round: "WILDCARD",
    homeCode: "PHI",
    awayCode: "GB",
    kickoffAt: "2026-01-11T22:30:00.000Z",
  },
  {
    key: "WC-5",
    round: "WILDCARD",
    homeCode: "TB",
    awayCode: "MIN",
    kickoffAt: "2026-01-12T18:00:00.000Z",
  },
  {
    key: "WC-6",
    round: "WILDCARD",
    homeCode: "LAR",
    awayCode: "WAS",
    kickoffAt: "2026-01-12T22:30:00.000Z",
  },
  {
    key: "WC-BYE-KC",
    round: "WILDCARD",
    homeCode: "KC",
    awayCode: "BYE",
    kickoffAt: "2026-01-10T18:00:00.000Z",
  },
  {
    key: "WC-BYE-DET",
    round: "WILDCARD",
    homeCode: "DET",
    awayCode: "BYE",
    kickoffAt: "2026-01-10T18:00:00.000Z",
  },

  {
    key: "DIV-1",
    round: "DIVISIONAL",
    homeCode: "KC",
    awayCode: "BUF",
    kickoffAt: "2026-01-17T21:30:00.000Z",
  },
  {
    key: "DIV-2",
    round: "DIVISIONAL",
    homeCode: "BAL",
    awayCode: "HOU",
    kickoffAt: "2026-01-18T01:15:00.000Z",
  },
  {
    key: "DIV-3",
    round: "DIVISIONAL",
    homeCode: "DET",
    awayCode: "PHI",
    kickoffAt: "2026-01-18T21:30:00.000Z",
  },
  {
    key: "DIV-4",
    round: "DIVISIONAL",
    homeCode: "LAR",
    awayCode: "TB",
    kickoffAt: "2026-01-19T01:15:00.000Z",
  },

  {
    key: "CONF-1",
    round: "CONFERENCE",
    homeCode: "KC",
    awayCode: "BAL",
    kickoffAt: "2026-01-25T21:30:00.000Z",
  },
  {
    key: "CONF-2",
    round: "CONFERENCE",
    homeCode: "DET",
    awayCode: "LAR",
    kickoffAt: "2026-01-26T01:15:00.000Z",
  },

  {
    key: "SB-1",
    round: "SUPER_BOWL",
    homeCode: "KC",
    awayCode: "DET",
    kickoffAt: "2026-02-08T23:30:00.000Z",
  },
];

const LAST_OPPONENT_BY_ROUND = {
  WILDCARD: {},
  DIVISIONAL: {
    KC: "BYE",
    DET: "BYE",
    BUF: "PIT",
    BAL: "LAC",
    HOU: "CIN",
    PHI: "GB",
    TB: "MIN",
    LAR: "WAS",
  },
  CONFERENCE: {
    KC: "BUF",
    BAL: "HOU",
    DET: "PHI",
    LAR: "TB",
  },
  SUPER_BOWL: {
    KC: "BAL",
    DET: "LAR",
  },
};

function roundToOne(value) {
  return Math.round((Number(value) + Number.EPSILON) * 10) / 10;
}

function buildZeroStats(position) {
  if (position === "QB") {
    return {
      passingYards: 0,
      passingTDs: 0,
      interceptions: 0,
      rushingYards: 0,
      rushingTDs: 0,
      fumble: 0,
    };
  }

  if (position === "RB") {
    return {
      rushingYards: 0,
      rushingTDs: 0,
      receivedYards: 0,
      receivedTDs: 0,
      fumble: 0,
    };
  }

  if (position === "WR" || position === "TE") {
    return {
      receivedYards: 0,
      receivedTDs: 0,
      rushingYards: 0,
      rushingTDs: 0,
      fumbles: 0,
    };
  }

  if (position === "K") {
    return {
      fg0to49Yards: 0,
      fg50plusYards: 0,
      xp: 0,
    };
  }

  return {
    interception: 0,
    forcedFumble: 0,
    sack: 0,
    safety: 0,
    returnTD: 0,
    allowedPoints: 0,
  };
}

function clamp(min, max, value) {
  return Math.max(min, Math.min(max, value));
}

function buildAverageStats(position, profile) {
  if (position === "QB") {
    return {
      passingYards: Math.round(225 + profile.offense * 28),
      passingTDs: profile.offense >= 1.12 ? 2 : 1,
      interceptions: profile.offense >= 1.08 ? 0 : 1,
      rushingYards: Math.round(10 + profile.rush * 10),
      rushingTDs: profile.rush >= 1.12 ? 1 : 0,
      fumble: 0,
    };
  }

  if (position === "RB") {
    return {
      rushingYards: Math.round(62 + profile.rush * 24),
      rushingTDs: profile.rush >= 1.05 ? 1 : 0,
      receivedYards: Math.round(16 + profile.offense * 10),
      receivedTDs: profile.offense >= 1.18 ? 1 : 0,
      fumble: 0,
    };
  }

  if (position === "WR") {
    return {
      receivedYards: Math.round(58 + profile.offense * 18),
      receivedTDs: profile.offense >= 1.08 ? 1 : 0,
      rushingYards: profile.rush >= 1.12 ? 8 : 0,
      rushingTDs: 0,
      fumbles: 0,
    };
  }

  if (position === "TE") {
    return {
      receivedYards: Math.round(42 + profile.offense * 14),
      receivedTDs: profile.offense >= 1.15 ? 1 : 0,
      rushingYards: 0,
      rushingTDs: 0,
      fumbles: 0,
    };
  }

  if (position === "K") {
    return {
      fg0to49Yards: profile.offense >= 1.14 ? 1 : 2,
      fg50plusYards: profile.defense >= 1.02 ? 1 : 0,
      xp: profile.offense >= 1.12 ? 3 : 2,
    };
  }

  return {
    interception: profile.defense >= 1.05 ? 1 : 0,
    forcedFumble: profile.defense >= 1.0 ? 1 : 0,
    sack: Math.round(2 + profile.defense * 2),
    safety: 0,
    returnTD: profile.defense >= 1.18 ? 1 : 0,
    allowedPoints: Math.round(16 + (1.18 - profile.defense) * 8),
  };
}

function buildWeeklyStats(position, profile, opponentProfile, roundIndex, isBye = false) {
  if (isBye) {
    return buildZeroStats(position);
  }

  const oppDefense = opponentProfile?.defense ?? 1;
  const oppOffense = opponentProfile?.offense ?? 1;
  const oppRush = opponentProfile?.rush ?? 1;

  if (position === "QB") {
    return {
      passingYards: Math.round(
        clamp(170, 360, 205 + profile.offense * 34 + roundIndex * 8 - oppDefense * 12)
      ),
      passingTDs: clamp(
        1,
        3,
        Math.round(1 + profile.offense * 0.9 + roundIndex * 0.15 - oppDefense * 0.35)
      ),
      interceptions: profile.offense >= oppDefense ? 0 : 1,
      rushingYards: Math.round(clamp(0, 60, 6 + profile.rush * 16 - roundIndex)),
      rushingTDs: profile.rush >= 1.12 ? 1 : 0,
      fumble: profile.offense < 0.95 ? 1 : 0,
    };
  }

  if (position === "RB") {
    return {
      rushingYards: Math.round(
        clamp(35, 145, 52 + profile.rush * 32 + roundIndex * 5 - oppDefense * 9)
      ),
      rushingTDs: profile.rush >= 1.06 ? 1 : 0,
      receivedYards: Math.round(clamp(6, 52, 10 + profile.offense * 12 - oppDefense * 3)),
      receivedTDs: profile.offense >= 1.2 ? 1 : 0,
      fumble: profile.rush < 0.92 ? 1 : 0,
    };
  }

  if (position === "WR") {
    return {
      receivedYards: Math.round(
        clamp(32, 155, 48 + profile.offense * 26 + roundIndex * 4 - oppDefense * 8)
      ),
      receivedTDs: profile.offense >= 1.08 ? 1 : 0,
      rushingYards: profile.rush >= 1.14 ? 10 : 0,
      rushingTDs: profile.rush >= 1.22 ? 1 : 0,
      fumbles: 0,
    };
  }

  if (position === "TE") {
    return {
      receivedYards: Math.round(
        clamp(20, 120, 34 + profile.offense * 18 + roundIndex * 3 - oppDefense * 6)
      ),
      receivedTDs: profile.offense >= 1.16 ? 1 : 0,
      rushingYards: 0,
      rushingTDs: 0,
      fumbles: 0,
    };
  }

  if (position === "K") {
    return {
      fg0to49Yards: profile.offense >= 1.12 ? 1 : 2,
      fg50plusYards: profile.defense >= 1.02 ? 1 : 0,
      xp: clamp(1, 4, Math.round(2 + profile.offense * 1.0 - oppDefense * 0.2)),
    };
  }

  return {
    interception: profile.defense >= 1.04 ? 1 : 0,
    forcedFumble: profile.defense >= 1.0 ? 1 : 0,
    sack: clamp(1, 6, Math.round(2 + profile.defense * 2 + roundIndex * 0.5 - oppOffense * 0.4)),
    safety: profile.defense >= 1.2 ? 1 : 0,
    returnTD: profile.defense >= 1.18 && oppOffense < 1 ? 1 : 0,
    allowedPoints: Math.round(
      clamp(7, 34, 17 + oppOffense * 6 - profile.defense * 4 + roundIndex)
    ),
  };
}

function buildDefenseTendency(opponentProfile, isBye = false) {
  if (isBye || !opponentProfile) {
    return {
      allowedPassingYards: null,
      allowedRushingYards: null,
    };
  }

  return {
    allowedPassingYards: roundToOne(198 + (1.25 - opponentProfile.defense) * 36),
    allowedRushingYards: roundToOne(92 + (1.18 - opponentProfile.defense) * 24),
  };
}

function createPlayerRow({
  season,
  round,
  position,
  teamCode,
  opponentCode,
  lastOpponentCode,
  gameKey,
}) {
  const profile = TEAM_INFO[teamCode];
  const opponentProfile = opponentCode && opponentCode !== "BYE" ? TEAM_INFO[opponentCode] : null;
  const roundIndex = ["WILDCARD", "DIVISIONAL", "CONFERENCE", "SUPER_BOWL"].indexOf(round);
  const isBye = opponentCode === "BYE";

  const weeklyStats = buildWeeklyStats(position, profile, opponentProfile, roundIndex, isBye);
  const avgStats = buildAverageStats(position, profile);
  const currentScore = roundToOne(calculatePerfectChallengeScore(position, weeklyStats));
  const avgScore = roundToOne(calculatePerfectChallengeScore(position, avgStats));
  const tendencies = buildDefenseTendency(opponentProfile, isBye);

  const displayName = `${profile.label} ${position}`;
  const firstName = profile.label;
  const lastName = position;

  return {
    season,
    round,
    position,
    playerKey: `${teamCode}:${position}`,
    teamCode,
    firstName,
    lastName,
    displayName,
    headshotUrl: null,
    isDefense: position === "DEF",
    currentScore,
    avgScore,
    lastWeekOpponentTeam:
      lastOpponentCode && lastOpponentCode !== "BYE"
        ? TEAM_INFO[lastOpponentCode]?.name || lastOpponentCode
        : lastOpponentCode || null,
    opponentDefenseTeamCode: opponentCode && opponentCode !== "BYE" ? opponentCode : null,
    currentWeekOpponentTeam:
      opponentCode && opponentCode !== "BYE"
        ? TEAM_INFO[opponentCode]?.name || opponentCode
        : "BYE",
    currentWeekOpponentDefenseTeamCode:
      opponentCode && opponentCode !== "BYE" ? opponentCode : null,
    allowedPassingYards: tendencies.allowedPassingYards,
    allowedRushingYards: tendencies.allowedRushingYards,
    overallStats: {
      sampleGames: roundIndex + 4,
      avgFantasyPoints: avgScore,
      teamStrength: profile.offense,
      runStrength: profile.rush,
      defenseStrength: profile.defense,
    },
    weeklyStats,
    isActive: true,
    gameKey,
  };
}

function buildPlayersForGame(game, season) {
  const players = [];
  const lastOpponents = LAST_OPPONENT_BY_ROUND[game.round] || {};

  const homeTeamPlayers = ["QB", "RB", "WR", "TE", "K", "DEF"].map((position) =>
    createPlayerRow({
      season,
      round: game.round,
      position,
      teamCode: game.homeCode,
      opponentCode: game.awayCode,
      lastOpponentCode: lastOpponents[game.homeCode] || null,
      gameKey: game.key,
    })
  );

  players.push(...homeTeamPlayers);

  if (game.awayCode !== "BYE") {
    const awayTeamPlayers = ["QB", "RB", "WR", "TE", "K", "DEF"].map((position) =>
      createPlayerRow({
        season,
        round: game.round,
        position,
        teamCode: game.awayCode,
        opponentCode: game.homeCode,
        lastOpponentCode: lastOpponents[game.awayCode] || null,
        gameKey: game.key,
      })
    );

    players.push(...awayTeamPlayers);
  }

  return players;
}

export function buildPlayoffChallengeTestData(season = 2025) {
  const games = ROUND_GAMES.map((game) => ({
    key: game.key,
    season,
    week: ROUND_WEEK[game.round],
    gameType: ROUND_GAME_TYPE[game.round],
    kickoffAt: game.kickoffAt,
    homeTeam: TEAM_INFO[game.homeCode]?.name || game.homeCode,
    awayTeam: game.awayCode === "BYE" ? "BYE" : TEAM_INFO[game.awayCode]?.name || game.awayCode,
    status: "SCHEDULED",
  }));

  const players = ROUND_GAMES.flatMap((game) => buildPlayersForGame(game, season));

  return { games, players };
}