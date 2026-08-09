import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { teamCodeFromApiId } from "../lib/nflTeams.js";

const LEAGUE_ID = 1; // NFL
const API_BASE = "https://v1.american-football.api-sports.io";

function parseWeekNumber(weekStr = "") {
  const m = /Week\s+(\d+)/i.exec(weekStr);
  return m ? parseInt(m[1], 10) : null;
}

async function fetchGames(season) {
  const res = await fetch(`${API_BASE}/games?league=${LEAGUE_ID}&season=${season}`, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY }
  });

  if (!res.ok) {
    throw new Error(`API-Football hívás sikertelen: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football hiba: ${JSON.stringify(data.errors)}`);
  }

  return data.response || [];
}

async function syncSeason(season) {
  console.log(`NFL meccsek lekérése: ${season} szezon...`);
  const games = await fetchGames(season);
  console.log(`${games.length} meccs érkezett az API-ból (minden stage).`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const g of games) {
    // Csak az alapszakasz (Regular Season) kell az általános Schedule/Standings/Stats oldalakhoz.
    // Az előszezon nincs használva sehol, a rájátszást a Playoff Challenge modul kezeli külön.
    if (g.game?.stage !== "Regular Season") {
      skipped++;
      continue;
    }

    const homeCode = teamCodeFromApiId(g.teams?.home?.id);
    const awayCode = teamCodeFromApiId(g.teams?.away?.id);
    const week = parseWeekNumber(g.game?.week);

    if (!homeCode || !awayCode || week == null) {
      skipped++;
      continue;
    }

    const gameType = "REG";
    const kickoffAt = new Date((g.game?.date?.timestamp || 0) * 1000);
    const isFinal = ["FT", "AOT"].includes(g.game?.status?.short);
    const status = isFinal ? "FINAL" : "SCHEDULED";
    const homeScore = isFinal ? g.scores?.home?.total ?? null : null;
    const awayScore = isFinal ? g.scores?.away?.total ?? null : null;

    const existing = await prisma.game.findFirst({
      where: { season, week, gameType, homeTeam: homeCode, awayTeam: awayCode }
    });

    if (existing) {
      await prisma.game.update({
        where: { id: existing.id },
        data: { kickoffAt, homeScore, awayScore, status }
      });
      updated++;
    } else {
      await prisma.game.create({
        data: {
          season, week, gameType, kickoffAt,
          homeTeam: homeCode, awayTeam: awayCode,
          homeScore, awayScore, status
        }
      });
      created++;
    }
  }

  console.log(`Kész. Új: ${created}, frissítve: ${updated}, kihagyva (nem alapszakasz vagy ismeretlen csapat): ${skipped}`);
}

const season = Number(process.argv[2]) || new Date().getFullYear();
syncSeason(season)
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Sync hiba:", err);
    prisma.$disconnect();
    process.exit(1);
  });