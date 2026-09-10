import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { teamCodeFromApiId } from "../lib/nflTeams.js";
import { fetchFieldGoalYardsByPlayer, bucketFieldGoalYards } from "../lib/fieldGoalEvents.js";

const API_BASE = "https://v1.american-football.api-sports.io";

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseSplit(value) {
  if (value == null) return [0, 0];
  const m = /^(-?\d+)[\/\-](-?\d+)$/.exec(String(value));
  if (!m) return [0, 0];
  return [Number(m[1]), Number(m[2])];
}

function statMap(statistics = []) {
  const m = {};
  for (const s of statistics) m[s.name] = s.value;
  return m;
}

async function fetchGameBoxscoreRaw(apiGameId) {
  const res = await fetch(`${API_BASE}/games/statistics/players?id=${apiGameId}`, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(JSON.stringify(data.errors));
  }
  return data.response || [];
}

async function resyncSingleGame(apiGameId) {
  const game = await prisma.game.findFirst({ where: { apiGameId: Number(apiGameId) } });

  if (!game) {
    console.error(`Nincs ilyen apiGameId a Game táblában: ${apiGameId}`);
    return;
  }

  console.log(
    `Meccs megtalálva: id=${game.id}, season=${game.season}, week=${game.week}, gameType=${game.gameType}, status=${game.status}, statsSynced=${game.statsSynced}`
  );

  const teamsStats = await fetchGameBoxscoreRaw(apiGameId);
  const fgYardsByPlayer = await fetchFieldGoalYardsByPlayer(apiGameId);

  console.log("Field goal események (apiPlayerId -> yardok):", Object.fromEntries(fgYardsByPlayer));

  for (const teamBlock of teamsStats) {
    const teamCode = teamCodeFromApiId(teamBlock.team?.id) || teamBlock.team?.name;

    for (const group of teamBlock.groups || []) {
      if (group.name !== "Kicking") continue;

      for (const p of group.players || []) {
        const apiPlayerId = p.player?.id;
        const playerName = p.player?.name;
        if (!apiPlayerId || !playerName) continue;

        const s = statMap(p.statistics);
        const [fgm, fga] = parseSplit(s["field goals"]);
        const [xpm, xpa] = parseSplit(s["extra point"]);

        const yardsList = fgYardsByPlayer.get(apiPlayerId) || [];
        const { fg0to49Yards: fg0to49, fg50plusYards: fg50plus } = bucketFieldGoalYards(yardsList);

        const stats = {
          fgm, fga, xpm, xpa,
          pts: num(s["points"]), long: num(s["long"]),
          fg0to49, fg50plus,
        };

        console.log(`Kicker: ${playerName} (${teamCode}) - beírandó stats:`, stats);

        const id = `${game.season}-${apiGameId}-field_goals-${apiPlayerId}`;
        await prisma.playerGameStat.upsert({
          where: {
            season_apiGameId_category_apiPlayerId: {
              season: game.season, apiGameId: Number(apiGameId), category: "field_goals", apiPlayerId,
            },
          },
          update: { playerName, team: teamCode, stats, week: game.week },
          create: {
            id, season: game.season, week: game.week, apiGameId: Number(apiGameId),
            category: "field_goals", apiPlayerId, playerName, team: teamCode, stats,
          },
        });

        console.log(`  -> PlayerGameStat elmentve/frissítve.`);
      }
    }
  }

  console.log("Kész. (Csak a 'field_goals' kategóriát frissítettük ezzel a teszt-scripttel.)");
}

const apiGameId = process.argv[2];

if (!apiGameId) {
  console.error("Használat: node src/scripts/resyncSingleGameFieldGoals.js <apiGameId>");
  process.exit(1);
}

resyncSingleGame(apiGameId)
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Hiba:", err);
    prisma.$disconnect();
    process.exit(1);
  });