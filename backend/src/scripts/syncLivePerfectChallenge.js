import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { calculatePerfectChallengeScore } from "../lib/perfectChallengeScoring.js";

function buildWeeklyStatsForPosition(position, cats) {
  const passing = cats.passing || {};
  const rushing = cats.rushing || {};
  const receiving = cats.receiving || {};
  const fumbles = cats.fumbles || {};
  const kicking = cats.field_goals || {};

  if (position === "QB") {
    return {
      passingYards: passing.passYds || 0,
      passingTDs: passing.td || 0,
      interceptions: passing.int || 0,
      rushingYards: rushing.rushYds || 0,
      rushingTDs: rushing.td || 0,
      fumble: fumbles.fum || 0,
    };
  }
  if (position === "RB") {
    return {
      rushingYards: rushing.rushYds || 0,
      rushingTDs: rushing.td || 0,
      receivedYards: receiving.yds || 0,
      receivedTDs: receiving.td || 0,
      fumble: fumbles.fum || 0,
    };
  }
  if (position === "WR" || position === "TE") {
    return {
      receivedYards: receiving.yds || 0,
      receivedTDs: receiving.td || 0,
      rushingYards: rushing.rushYds || 0,
      rushingTDs: rushing.td || 0,
      fumbles: fumbles.fum || 0,
    };
  }
  if (position === "K") {
    return {
      fg0to49Yards: kicking.fg0to49 || 0,
      fg50plusYards: kicking.fg50plus || 0,
      xp: kicking.xpm || 0,
    };
  }
  return {};
}

async function computeAvgScore(season, displayName, teamCode, uptoWeek, override) {
  const rows = await prisma.perfectChallengePlayer.findMany({
    where: { season, displayName, teamCode, week: { lte: uptoWeek } },
    select: { week: true, currentScore: true },
  });

  const scores = rows.map((r) =>
    r.week === uptoWeek ? override : Number(r.currentScore || 0)
  );

  if (!scores.length) return override;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

async function updateDefenseRow(season, week, teamCode, opponentCode, gameStats, opponentCurrentScore) {
  const teamTackles = gameStats.filter((r) => r.team === teamCode && r.category === "tackles");
  const oppPassing = gameStats.filter((r) => r.team === opponentCode && r.category === "passing");

  const forcedFumble = teamTackles.reduce((sum, r) => sum + Number(r.stats.ff || 0), 0);
  const sack = teamTackles.reduce((sum, r) => sum + Number(r.stats.sacks || 0), 0);
  const returnTD = teamTackles.reduce((sum, r) => sum + Number(r.stats.intTd || 0), 0);
  const interception = oppPassing.reduce((sum, r) => sum + Number(r.stats.int || 0), 0);

  const weeklyStats = {
    interception,
    forcedFumble,
    sack,
    safety: 0,
    returnTD,
    allowedPoints: Number(opponentCurrentScore ?? 0),
  };

  const currentScore = calculatePerfectChallengeScore("DEF", weeklyStats);
  const id = `${season}-${week}-DEF-${teamCode}`;

  const existing = await prisma.perfectChallengePlayer.findUnique({ where: { id } });
  if (!existing) return;

  const avgScore = await computeAvgScore(season, existing.displayName, teamCode, week, currentScore);

  await prisma.perfectChallengePlayer.update({
    where: { id },
    data: { weeklyStats, currentScore, avgScore },
  });
}

export async function syncLivePerfectChallenge(season) {
  const dirtyGames = await prisma.game.findMany({
    where: {
      season,
      gameType: "REG",
      OR: [
        { status: "IN_PROGRESS" },
        { status: "FINAL", pcStatsSynced: false },
      ],
    },
  });

  if (!dirtyGames.length) {
    console.log(`[live-pc] Nincs frissitendo meccs.`);
    return { gamesProcessed: 0, playersUpdated: 0 };
  }

  let playersUpdated = 0;

  for (const game of dirtyGames) {
    if (!game.apiGameId) continue;

    const gameStats = await prisma.playerGameStat.findMany({
      where: { season, apiGameId: game.apiGameId },
    });

    if (!gameStats.length) continue;

    const byPlayer = {};
    for (const row of gameStats) {
      byPlayer[row.apiPlayerId] ||= { team: row.team, cats: {} };
      byPlayer[row.apiPlayerId].cats[row.category] = row.stats;
    }

    for (const [apiPlayerIdStr, data] of Object.entries(byPlayer)) {
      const apiPlayerId = Number(apiPlayerIdStr);
      const id = `${season}-${game.week}-${apiPlayerId}`;

      const pcPlayer = await prisma.perfectChallengePlayer.findUnique({ where: { id } });
      if (!pcPlayer || pcPlayer.isDefense) continue;

      const weeklyStats = buildWeeklyStatsForPosition(pcPlayer.position, data.cats);
      const currentScore = calculatePerfectChallengeScore(pcPlayer.position, weeklyStats);
      const avgScore = await computeAvgScore(
        season, pcPlayer.displayName, pcPlayer.teamCode, game.week, currentScore
      );

      await prisma.perfectChallengePlayer.update({
        where: { id },
        data: { weeklyStats, currentScore, avgScore },
      });

      playersUpdated++;
    }

    await updateDefenseRow(season, game.week, game.homeTeam, game.awayTeam, gameStats, game.awayScore);
    await updateDefenseRow(season, game.week, game.awayTeam, game.homeTeam, gameStats, game.homeScore);
    playersUpdated += 2;

    if (game.status === "FINAL") {
      await prisma.game.update({ where: { id: game.id }, data: { pcStatsSynced: true } });
    }
  }

  console.log(`[live-pc] ${playersUpdated} Perfect Challenge sor frissitve.`);
  return { gamesProcessed: dirtyGames.length, playersUpdated };
}

if (process.argv[1] && process.argv[1].endsWith("syncLivePerfectChallenge.js")) {
  const season = Number(process.argv[2]) || new Date().getFullYear();
  syncLivePerfectChallenge(season)
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error("Hiba:", err);
      prisma.$disconnect();
      process.exit(1);
    });
}