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

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Ha egy korábban Excel-ből kézzel felvitt ("XLS-" ID-jú) játékos mostantól
// már megjelenik az API-ból is, a két sor "ugyanazt az embert" jelenti.
// Ilyenkor a felhasználók már meglévő pickjeit (PerfectChallengeRosterSlot)
// át kell irányítani az új, API-alapú sorra, MIELŐTT a régi Excel-sort
// töröljük - különben a CASCADE törlés a pickeket is magával rántaná.
// Ezt a lépést a heti sync-loop UTÁN kell futtatni, amikor a valódi
// API-alapú sorok már biztosan léteznek minden hétre.
async function reconcileImportedPlayers(season, weeks, relevantPlayers) {
  const xlsRows = await prisma.perfectChallengePlayer.findMany({
    where: {
      season,
      week: { in: weeks },
      id: { contains: "-XLS-" },
    },
    select: { id: true, week: true, displayName: true, teamCode: true, position: true },
  });

  if (!xlsRows.length) return;

  const apiPlayerByTeamPosition = new Map();
  for (const p of relevantPlayers) {
    const key = `${p.teamCode}::${p.position}`;
    if (!apiPlayerByTeamPosition.has(key)) apiPlayerByTeamPosition.set(key, []);
    apiPlayerByTeamPosition.get(key).push(p);
  }

  let migratedSlots = 0;
  let deletedOrphans = 0;
  const idsToDelete = [];

  for (const xlsRow of xlsRows) {
    const key = `${xlsRow.teamCode}::${xlsRow.position}`;
    const candidates = apiPlayerByTeamPosition.get(key) || [];
    const normalizedXlsName = normalizeName(xlsRow.displayName);

    const match = candidates.find(
      (c) => normalizeName(c.name) === normalizedXlsName
    );

    if (!match) continue; // ez a játékos még mindig csak Excel-ből van meg, hagyjuk

    const newId = `${season}-${xlsRow.week}-${match.apiPlayerId}`;

    // Csak akkor migrálunk, ha az új (API-alapú) sor ténylegesen létezik erre a hétre
    const newRowExists = await prisma.perfectChallengePlayer.findUnique({
      where: { id: newId },
      select: { id: true },
    });

    if (!newRowExists) continue;

    // Meglévő felhasználói pickek átirányítása az új sorra
    const updateResult = await prisma.perfectChallengeRosterSlot.updateMany({
      where: { playerId: xlsRow.id },
      data: { playerId: newId },
    });

    migratedSlots += updateResult.count;
    idsToDelete.push(xlsRow.id);
  }

  if (idsToDelete.length) {
    const result = await prisma.perfectChallengePlayer.deleteMany({
      where: { id: { in: idsToDelete } },
    });
    deletedOrphans = result.count;
  }

  console.log(
    `Összevonás: ${migratedSlots} felhasználói pick átirányítva, ${deletedOrphans} elavult "XLS-" sor törölve.`
  );
}

export async function syncRoster(season, weeks) {
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

  // Ellenfél-lekérdezés a már betöltött Schedule (Game) adatokból
  const allWeeksNeeded = [...new Set(weeks.flatMap((w) => [w - 1, w]))].filter((w) => w > 0);
  const games = await prisma.game.findMany({
    where: { season, gameType: "REG", week: { in: allWeeksNeeded } },
  });

  const opponentByWeekTeam = {}; // opponentByWeekTeam[week][teamCode] = opponentCode
  for (const g of games) {
    opponentByWeekTeam[g.week] ||= {};
    opponentByWeekTeam[g.week][g.homeTeam] = g.awayTeam;
    opponentByWeekTeam[g.week][g.awayTeam] = g.homeTeam;
  }

  let count = 0;
  const totalToWrite = relevantPlayers.length * weeks.length;

  for (const week of weeks) {
    for (const p of relevantPlayers) {
      const { firstName, lastName } = splitName(p.name);
      const id = `${season}-${week}-${p.apiPlayerId}`;
      const currentWeekOpponentTeam = opponentByWeekTeam[week]?.[p.teamCode] || null;
      const lastWeekOpponentTeam = opponentByWeekTeam[week - 1]?.[p.teamCode] || null;

      await prisma.perfectChallengePlayer.upsert({
        where: { id },
        update: {
          teamCode: p.teamCode,
          firstName,
          lastName,
          displayName: p.name,
          headshotUrl: p.headshotUrl,
          currentWeekOpponentTeam,
          lastWeekOpponentTeam,
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
          currentWeekOpponentTeam,
          lastWeekOpponentTeam,
        },
      });

      count += 1;
      if (count % 200 === 0) {
        console.log(`  ...${count}/${totalToWrite} sor kész`);
      }
    }
  }

  // Csak MOST, hogy minden API-alapú sor biztosan létezik minden hétre,
  // fussunk neki az Excel-eredetű duplikátumok összevonásának.
  await reconcileImportedPlayers(season, weeks, relevantPlayers);

  console.log(`Kész. ${count} sor létrehozva/frissítve.`);
  return { count };
}

if (process.argv[1] && process.argv[1].endsWith("syncPerfectChallengeRoster.js")) {
  const season = Number(process.argv[2]) || new Date().getFullYear();
  const weeks = Array.from({ length: 18 }, (_, i) => i + 1);

  syncRoster(season, weeks)
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error("Hiba:", err);
      prisma.$disconnect();
      process.exit(1);
    });
}