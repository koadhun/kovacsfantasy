import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { teamCodeFromApiId, TEAM_CODE_BY_API_ID } from "../lib/nflTeams.js";

const API_BASE = "https://v1.american-football.api-sports.io";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTeamRoster(apiTeamId, season) {
  const res = await fetch(
    `${API_BASE}/players?season=${season}&team=${apiTeamId}`,
    { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
  );

  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(JSON.stringify(data.errors));
  }

  return data.response || [];
}

function zeroStats(category, player, teamCode) {
  const name = player.name;

  switch (category) {
    case "passing":
      return { player: name, passYds: 0, att: 0, cmp: 0, cmpPct: 0, ydsAtt: 0, td: 0, int: 0, rate: 0, sck: 0, sckY: 0 };
    case "rushing":
      return { player: name, rushYds: 0, att: 0, ydsAtt: 0, td: 0, first: 0, firstPct: 0, "20+": 0, "40+": 0, lng: 0, fum: 0 };
    case "receiving":
      return { player: name, rec: 0, tgt: 0, yds: 0, ydsRec: 0, td: 0, first: 0, firstPct: 0, "20+": 0, "40+": 0, lng: 0, fum: 0 };
    case "fumbles":
      return { player: name, fum: 0, lost: 0, oob: 0, forced: 0, ownRec: 0, oppRec: 0 };
    case "tackles":
      return { player: name, comb: 0, solo: 0, ast: 0, tfl: 0, qbHits: 0, sacks: 0, ff: 0, fr: 0 };
    case "field_goals":
      return { player: name, fgm: 0, fga: 0, pct: 0, lng: 0, xpm: 0, xpa: 0, pts: 0 };
    case "kickoff_returns":
      return { player: name, ret: 0, yds: 0, avg: 0, td: 0, lng: 0 };
    case "punting":
      return { player: name, punts: 0, yds: 0, avg: 0, lng: 0, in20: 0, tb: 0 };
    default:
      return { player: name };
  }
}

function categoriesForPlayer(player) {
  const pos = player.position;
  const group = player.group;
  const cats = [];

  if (pos === "QB") cats.push("passing", "rushing", "fumbles");
  if (pos === "RB") cats.push("rushing", "receiving", "fumbles", "kickoff_returns");
  if (pos === "WR") cats.push("receiving", "rushing", "fumbles", "kickoff_returns");
  if (pos === "TE") cats.push("receiving", "fumbles");
  if (pos === "PK") cats.push("field_goals");
  if (pos === "P") cats.push("punting");
  if (group === "Defense") cats.push("tackles");

  return cats;
}

async function syncStatsRoster(season) {
  const apiTeamIds = Object.keys(TEAM_CODE_BY_API_ID).map(Number);
  let count = 0;

  for (const apiTeamId of apiTeamIds) {
    const teamCode = teamCodeFromApiId(apiTeamId);
    console.log(`Roster lekérése: ${teamCode} (team=${apiTeamId})...`);

    let roster = [];
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        roster = await fetchTeamRoster(apiTeamId, season);
        break;
      } catch (err) {
        console.warn(`  Hiba (${attempt}. próbálkozás): ${err.message}`);
        await sleep(1500 * attempt);
      }
    }

    for (const p of roster) {
      const cats = categoriesForPlayer(p);

      for (const category of cats) {
        await prisma.playerStat.upsert({
          where: {
            season_category_apiPlayerId: { season, category, apiPlayerId: p.id },
          },
          update: { playerName: p.name, team: teamCode },
          create: {
            season,
            category,
            apiPlayerId: p.id,
            playerName: p.name,
            team: teamCode,
            stats: zeroStats(category, p, teamCode),
          },
        });
        count++;
      }
    }

    await sleep(300);
  }

  console.log(`Kész. ${count} PlayerStat sor létrehozva/frissítve (nullás kezdőértékekkel).`);
}

const season = Number(process.argv[2]) || new Date().getFullYear();
syncStatsRoster(season)
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Hiba:", err);
    prisma.$disconnect();
    process.exit(1);
  });