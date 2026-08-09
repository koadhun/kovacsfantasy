import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { teamCodeFromApiId } from "../lib/nflTeams.js";

const LEAGUE_ID = 1; // NFL
const API_BASE = "https://v1.american-football.api-sports.io";

// A Playoff Challenge modul saját logikával kezeli a rájátszást (más csapat-
// elnevezéssel is), ezért azt itt szándékosan NEM szinkronizáljuk, hogy ne
// duplikáljuk / zavarjuk össze a meglévő adatait.
const STAGE_TO_GAME_TYPE = {
  "Pre Season": "PRE",
  "Regular Season": "REG",
};

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
    const gameType = STAGE_TO_GAME_TYPE[g.game?.stage];

    // Rájátszás vagy ismeretlen stage -> kihagyjuk
    if (!gameType) {
      skipped++;
      continue;
    }

    const homeCode = teamCodeFromApiId(g.teams?.home?.id);
    const awayCode = teamCodeFromApiId(g.teams?.away?.id);
    const week = parseWeekNumber(g.game?.week);

    // Az "előszezon" API-nál néha nem "Week N" formátumú (pl. "Hall of Fame
    // Weekend") - ezt 0. hétként kezeljük, hogy legyen egyáltalán megjeleníthető.
    const resolvedWeek = week != null ? week : (gameType === "PRE" ? 0 : null);

    if (!homeCode || !awayCode || resolvedWeek == null) {
      skipped++;
      continue;
    }

    const kickoffAt = new Date((g.game?.date?.timestamp || 0) * 1000);
    const isFinal = ["FT", "AOT"].includes(g.game?.status?.short);
    const status = isFinal ? "FINAL" : "SCHEDULED";
    const homeScore = isFinal ? g.scores?.home?.total ?? null : null;
    const awayScore = isFinal ? g.scores?.away?.total ?? null : null;

    const existing = await prisma.game.findFirst({
      where: { season, week: resolvedWeek, gameType, homeTeam: homeCode, awayTeam: awayCode }
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
          season, week: resolvedWeek, gameType, kickoffAt,
          homeTeam: homeCode, awayTeam: awayCode,
          homeScore, awayScore, status
        }
      });
      created++;
    }
  }

  console.log(`Kész. Új: ${created}, frissítve: ${updated}, kihagyva (rájátszás vagy ismeretlen csapat): ${skipped}`);
}

const season = Number(process.argv[2]) || new Date().getFullYear();
syncSeason(season)
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Sync hiba:", err);
    prisma.$disconnect();
    process.exit(1);
  });