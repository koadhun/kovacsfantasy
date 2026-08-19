import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { syncStandings } from "./syncStandings.js";

const LEAGUE_ID = 1;
const API_BASE = "https://v1.american-football.api-sports.io";

function parseLiveState(statusShort, timerRaw) {
  if (["FT", "AOT"].includes(statusShort)) {
    return { status: "FINAL", liveQuarter: null, liveClock: null };
  }
  if (!statusShort || statusShort === "NS") {
    return { status: "SCHEDULED", liveQuarter: null, liveClock: null };
  }

  let liveQuarter = null;
  const qm = /^Q(\d)$/i.exec(statusShort);
  if (qm) liveQuarter = Number(qm[1]);
  else if (/^HT$/i.test(statusShort)) liveQuarter = 2;
  else if (/^OT$/i.test(statusShort)) liveQuarter = 5;

  return {
    status: "IN_PROGRESS",
    liveQuarter,
    liveClock: timerRaw ? String(timerRaw) : null,
  };
}

async function fetchSeasonGames(season) {
  const res = await fetch(`${API_BASE}/games?league=${LEAGUE_ID}&season=${season}`, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
  });

  if (!res.ok) throw new Error(`API-Football hivas sikertelen: ${res.status}`);

  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football hiba: ${JSON.stringify(data.errors)}`);
  }

  return data.response || [];
}

async function findActiveWeek(season) {
  const rows = await prisma.game.findMany({
    where: { season, gameType: "REG" },
    select: { week: true, status: true },
    orderBy: { week: "asc" },
  });

  const weeks = [...new Set(rows.map((r) => r.week))].sort((a, b) => a - b);

  for (const w of weeks) {
    const weekGames = rows.filter((r) => r.week === w);
    if (weekGames.some((g) => g.status !== "FINAL")) {
      return w;
    }
  }

  return weeks[weeks.length - 1] || null;
}

export async function syncLiveGames(season) {
  const activeWeek = await findActiveWeek(season);
  if (!activeWeek) {
    console.log(`[live-sync] Nincs alapszakasz-meccs a(z) ${season} szezonra.`);
    return { updated: 0, newlyFinal: 0 };
  }

  console.log(`[live-sync] Aktiv het: ${activeWeek}`);

  const apiGames = await fetchSeasonGames(season);

  const dbGames = await prisma.game.findMany({
    where: { season, week: activeWeek, gameType: "REG" },
  });

  const dbById = new Map(dbGames.map((g) => [g.apiGameId, g]));

  let updated = 0;
  let newlyFinal = false;

  for (const apiGame of apiGames) {
    if (apiGame.game?.stage !== "Regular Season") continue;

    const existing = dbById.get(apiGame.game.id);
    if (!existing) continue;

    const { status, liveQuarter, liveClock } = parseLiveState(
      apiGame.game?.status?.short,
      apiGame.game?.status?.timer
    );

    const homeScore = apiGame.scores?.home?.total ?? existing.homeScore;
    const awayScore = apiGame.scores?.away?.total ?? existing.awayScore;

    const changed =
      existing.status !== status ||
      existing.homeScore !== homeScore ||
      existing.awayScore !== awayScore ||
      existing.liveQuarter !== liveQuarter ||
      existing.liveClock !== liveClock;

    if (!changed) continue;

    if (status === "FINAL" && existing.status !== "FINAL") {
      newlyFinal = true;
    }

    await prisma.game.update({
      where: { id: existing.id },
      data: { status, homeScore, awayScore, liveQuarter, liveClock },
    });

    updated++;
  }

  console.log(`[live-sync] ${updated} meccs frissitve a(z) ${activeWeek}. heten.`);

  if (newlyFinal) {
    console.log(`[live-sync] Uj FINAL meccs -> Standings ujraszamolasa...`);
    await syncStandings(season);
  }

  return { updated, newlyFinal };
}

if (process.argv[1] && process.argv[1].endsWith("syncLiveGames.js")) {
  const season = Number(process.argv[2]) || new Date().getFullYear();
  syncLiveGames(season)
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error("Hiba:", err);
      prisma.$disconnect();
      process.exit(1);
    });
}