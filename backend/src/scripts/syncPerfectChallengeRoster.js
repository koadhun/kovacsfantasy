import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { teamCodeFromApiId, TEAM_CODE_BY_API_ID } from "../lib/nflTeams.js";

const API_BASE = "https://v1.american-football.api-sports.io";

const POSITION_MAP = {
  QB: "QB",
  RB: "RB",
  WR: "WR",
  TE: "TE",
  PK: "K",
};

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/);
  const firstName = parts.shift() || "";
  const lastName = parts.join(" ") || "";
  return { firstName, lastName };
}

async function fetchTeamRoster(apiTeamId, season) {
  const res = await fetch(
    `${API_BASE}/players?season=${season}&team=${apiTeamId}`,
    { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
  );

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(JSON.stringify(data.errors));
  }

  return data.response || [];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function syncRoster(season, weeks) {
  const apiTeamIds = Object.keys(TEAM_CODE_BY_API_ID).map(Number);
  const relevantPlayers = [];

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
      const position = POSITION_MAP[p.position];
      if (!position) continue; // csak QB/RB/WR/TE/K kell

      relevantPlayers.push({
        apiPlayerId: p.id,
        name: p.name,
        position,
        teamCode,
        headshotUrl: p.image || null,
      });
    }

    await sleep(300);
  }

  console.log(`${relevantPlayers.length} releváns (QB/RB/WR/TE/K) játékos található összesen.`);
  console.log(`Sorok létrehozása ${weeks.length} hétre...`);

  let count = 0;
  const totalToWrite = relevantPlayers.length * weeks.length;

  for (const week of weeks) {
    for (const p of relevantPlayers) {
      const { firstName, lastName } = splitName(p.name);
      const id = `${season}-${week}-${p.apiPlayerId}`;

      await prisma.perfectChallengePlayer.upsert({
        where: { id },
        update: {
          teamCode: p.teamCode,
          firstName,
          lastName,
          displayName: p.name,
          headshotUrl: p.headshotUrl,
          isActive: true,
        },
        create: {
          id,
          season,
          week,
          position: p.position,
          teamCode: p.teamCode,
          firstName,
          lastName,
          displayName: p.name,
          headshotUrl: p.headshotUrl,
          isDefense: false,
          currentScore: 0,
          avgScore: 0,
          overallStats: {},
          weeklyStats: {},
          isActive: true,
        },
      });

      count++;
      if (count % 200 === 0) console.log(`  ...${count}/${totalToWrite} sor mentve`);
    }
  }

  console.log(`Kész. ${count} PerfectChallengePlayer sor létrehozva/frissítve.`);
}

const season = Number(process.argv[2]) || new Date().getFullYear();
const weeksArg = process.argv[3];
const weeks = weeksArg
  ? weeksArg.split(",").map(Number)
  : Array.from({ length: 18 }, (_, i) => i + 1);

syncRoster(season, weeks)
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Hiba:", err);
    prisma.$disconnect();
    process.exit(1);
  });