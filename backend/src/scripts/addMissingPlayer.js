import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { teamCodeFromApiId } from "../lib/nflTeams.js";

const API_BASE = "https://v1.american-football.api-sports.io";

const POSITION_MAP = { QB: "QB", RB: "RB", WR: "WR", TE: "TE", PK: "K" };

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/);
  const firstName = parts.shift() || "";
  const lastName = parts.join(" ") || "";
  return { firstName, lastName };
}

async function findPlayerById(apiPlayerId) {
  const res = await fetch(`${API_BASE}/players?id=${apiPlayerId}`, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
  });
  const data = await res.json();
  return (data.response || [])[0] || null;
}

async function findPlayerByNameOnTeam(name, apiTeamId, season) {
  const res = await fetch(
    `${API_BASE}/players?season=${season}&team=${apiTeamId}`,
    { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
  );
  const data = await res.json();
  const list = data.response || [];
  const lower = name.toLowerCase();
  return list.find((p) => p.name.toLowerCase() === lower) || null;
}

async function addPlayer({ apiPlayerId, name, apiTeamId, season, weeks }) {
  let player = null;

  if (apiPlayerId) {
    player = await findPlayerById(apiPlayerId);
  } else if (name && apiTeamId) {
    player = await findPlayerByNameOnTeam(name, apiTeamId, season);
  }

  if (!player) {
    console.error("Nem található a játékos az API-ban a megadott adatokkal.");
    return;
  }

  const position = POSITION_MAP[player.position];
  if (!position) {
    console.error(`Nem támogatott pozíció: ${player.position} (csak QB/RB/WR/TE/PK).`);
    return;
  }

  const teamCode = teamCodeFromApiId(apiTeamId);
  if (!teamCode) {
    console.error("Ismeretlen csapat ID.");
    return;
  }

  const { firstName, lastName } = splitName(player.name);

  const allWeeksNeeded = [...new Set(weeks.flatMap((w) => [w - 1, w]))].filter((w) => w > 0);
  const games = await prisma.game.findMany({
    where: { season, gameType: "REG", week: { in: allWeeksNeeded } },
  });
  const opponentByWeekTeam = {};
  for (const g of games) {
    opponentByWeekTeam[g.week] ||= {};
    opponentByWeekTeam[g.week][g.homeTeam] = g.awayTeam;
    opponentByWeekTeam[g.week][g.awayTeam] = g.homeTeam;
  }

  for (const week of weeks) {
    const id = `${season}-${week}-${player.id}`;
    const currentWeekOpponentTeam = opponentByWeekTeam[week]?.[teamCode] || null;
    const lastWeekOpponentTeam = opponentByWeekTeam[week - 1]?.[teamCode] || null;

    await prisma.perfectChallengePlayer.upsert({
      where: { id },
      update: {
        teamCode, firstName, lastName, displayName: player.name,
        headshotUrl: player.image || null,
        currentWeekOpponentTeam, lastWeekOpponentTeam, isActive: true,
      },
      create: {
        id, season, week, position, teamCode, firstName, lastName,
        displayName: player.name, headshotUrl: player.image || null,
        isDefense: false, currentScore: 0, avgScore: 0,
        currentWeekOpponentTeam, lastWeekOpponentTeam,
        overallStats: {}, weeklyStats: {}, isActive: true,
      },
    });

    console.log(`OK: ${player.name} (${position}, ${teamCode}) hozzáadva a(z) ${week}. héthez.`);
  }
}

// Hasznalat:
//   node src/scripts/addMissingPlayer.js --id=12345 --season=2026 --weeks=3,4,5
//   node src/scripts/addMissingPlayer.js --name="Christian McCaffrey" --team=14 --season=2026 --weeks=3
//
// A --team az API-Football csapat-ID-ja (nem a rovidites!) - ha nem tudod, nezd meg a
// backend/src/lib/nflTeams.js TEAM_CODE_BY_API_ID listajat.

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v];
  })
);

const season = Number(args.season) || new Date().getFullYear();
const weeks = args.weeks ? args.weeks.split(",").map(Number) : [];
const apiPlayerId = args.id ? Number(args.id) : null;
const apiTeamId = args.team ? Number(args.team) : null;

if (!weeks.length || (!apiPlayerId && !(args.name && apiTeamId))) {
  console.error(
    "Hianyzo parameterek. Hasznalat:\n" +
    "  node src/scripts/addMissingPlayer.js --id=12345 --season=2026 --weeks=3,4,5\n" +
    "  node src/scripts/addMissingPlayer.js --name=\"Christian McCaffrey\" --team=14 --season=2026 --weeks=3"
  );
  process.exit(1);
}

addPlayer({ apiPlayerId, name: args.name, apiTeamId, season, weeks })
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Hiba:", err);
    prisma.$disconnect();
    process.exit(1);
  });