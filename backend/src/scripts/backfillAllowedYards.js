import "dotenv/config";
import { prisma } from "../lib/prisma.js";

// Visszamenőleges feltöltés: a már lejátszott (FINAL) meccsekhez kiszámolja a védelmi (DEF)
// sorok "kapott passz yard" és "kapott futott yard" értékét a már letárolt nyers
// játékosstatisztikából (PlayerGameStat). Nem hív API-t, és a pontszámokhoz sem nyúl,
// csak a két "allowed...Yards" mezőt írja.
//
// Használat (a backend mappából):
//   node src/scripts/backfillAllowedYards.js            (aktuális év)
//   node src/scripts/backfillAllowedYards.js 2026
//   node src/scripts/backfillAllowedYards.js 2026 --dry-run

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const season = Number(args.find((a) => /^\d{4}$/.test(a))) || new Date().getFullYear();

async function main() {
  const games = await prisma.game.findMany({
    where: { season, gameType: "REG", status: "FINAL", apiGameId: { not: null } },
    select: { id: true, week: true, homeTeam: true, awayTeam: true, apiGameId: true },
    orderBy: [{ week: "asc" }, { kickoffAt: "asc" }],
  });

  console.log(
    `${dryRun ? "[PRÓBAFUTÁS – nem ír az adatbázisba] " : ""}${season}: ${games.length} lejátszott meccs.`
  );
  if (!games.length) return;

  const statRows = await prisma.playerGameStat.findMany({
    where: {
      season,
      category: { in: ["passing", "rushing"] },
      apiGameId: { in: games.map((g) => g.apiGameId) },
    },
    select: { apiGameId: true, team: true, category: true, stats: true },
  });

  // meccs + csapat szerint összegzett támadó yardok: ennyit szerzett a csapat
  const gained = new Map();
  for (const r of statRows) {
    const key = `${r.apiGameId}|${r.team}`;
    const acc = gained.get(key) || { pass: 0, rush: 0, rows: 0 };
    const s = r.stats || {};
    if (r.category === "passing") acc.pass += Number(s.passYds || 0);
    if (r.category === "rushing") acc.rush += Number(s.rushYds || 0);
    acc.rows += 1;
    gained.set(key, acc);
  }

  let updated = 0;
  const noStats = [];
  const noDefRow = [];

  for (const game of games) {
    const home = gained.get(`${game.apiGameId}|${game.homeTeam}`);
    const away = gained.get(`${game.apiGameId}|${game.awayTeam}`);

    if (!home && !away) {
      noStats.push(`${game.week}. hét: ${game.awayTeam} @ ${game.homeTeam}`);
      continue;
    }

    // A hazai védelem az idegenbeli támadás yardjait kapta, és fordítva.
    const sides = [
      { defTeam: game.homeTeam, against: away },
      { defTeam: game.awayTeam, against: home },
    ];

    for (const { defTeam, against } of sides) {
      const allowedPassingYards = against?.pass ?? 0;
      const allowedRushingYards = against?.rush ?? 0;
      const id = `${season}-${game.week}-DEF-${defTeam}`;

      if (dryRun) {
        console.log(`  ${id}: passz ${allowedPassingYards}, futott ${allowedRushingYards}`);
        updated += 1;
        continue;
      }

      const res = await prisma.perfectChallengePlayer.updateMany({
        where: { id },
        data: { allowedPassingYards, allowedRushingYards },
      });

      if (res.count) updated += 1;
      else noDefRow.push(id);
    }
  }

  console.log(`\nKész. ${dryRun ? "Frissítendő" : "Frissített"} védelmi sor: ${updated}.`);

  if (noStats.length) {
    console.log(
      `\nFigyelem: ${noStats.length} lejátszott meccshez nincs letárolt játékosstatisztika, ezeket kihagytam:`
    );
    noStats.forEach((m) => console.log(`  - ${m}`));
    console.log("Ezekhez előbb a statisztika-szinkront kell lefuttatni (újra feldolgozni a meccset).");
  }

  if (noDefRow.length) {
    console.log(`\nFigyelem: ${noDefRow.length} védelmi sor nem létezik az adatbázisban:`);
    noDefRow.forEach((id) => console.log(`  - ${id}`));
    console.log("Ezekhez előbb futtasd: node src/scripts/syncPerfectChallengeDefense.js <év>");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Hiba:", err);
    prisma.$disconnect();
    process.exit(1);
  });
