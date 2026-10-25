import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { TEAM_CODE_BY_API_ID } from "../lib/nflTeams.js";

// Egyetlen olyan játékos kézi felvitele, akit az API még nem ad vissza.
//
// Ugyanazt az "XLS-" azonosítójú sort hozza létre, mint az importMissingRosterPlayers.js,
// ezért amint az API először visszaadja a játékost (heti roster sync vagy az első meccse
// élő szinkronja), az automatikusan megkapja az API ID-t, és a felhasználók pickjei
// átkerülnek az új sorra. Ennek feltétele, hogy a CSAPAT és a NÉV (ékezet, írásjel és
// kis-/nagybetű nélkül) egyezzen az API által küldöttel.
//
// Használat (a backend mappából):
//   node src/scripts/addExcelPlayer.js --name="Első Játékos" --team=BUF --pos=WR --jersey=12
//   node src/scripts/addExcelPlayer.js --name="Első Játékos" --team=BUF --pos=WR --dry-run
//
// Opcionális: --season=2026  --weeks=1-18  (vagy --weeks=7,8,9)  --first=...  --last=...

const SEASON_DEFAULT = 2026;
const POSITIONS = ["QB", "RB", "WR", "TE", "K"];
const POSITION_ALIASES = { PK: "K" };
const TEAM_CODES = new Set(Object.values(TEAM_CODE_BY_API_ID));

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // ékezetek eltávolítása
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(name) {
  return normalizeName(name).replace(/\s+/g, "-");
}

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/);
  const firstName = parts.shift() || "";
  const lastName = parts.join(" ") || "";
  return { firstName, lastName };
}

function parseArgs(argv) {
  const out = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const body = raw.slice(2);
    const eq = body.indexOf("=");
    if (eq === -1) out[body] = true;
    else out[body.slice(0, eq)] = body.slice(eq + 1);
  }
  return out;
}

function parseWeeks(value) {
  if (value == null || value === true) return Array.from({ length: 18 }, (_, i) => i + 1);

  const weeks = new Set();
  for (const part of String(value).split(",")) {
    const m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!m) return null;
    const from = Number(m[1]);
    const to = m[2] ? Number(m[2]) : from;
    if (from < 1 || to < from || to > 30) return null;
    for (let w = from; w <= to; w++) weeks.add(w);
  }
  return [...weeks].sort((a, b) => a - b);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const name = typeof args.name === "string" ? args.name.trim() : "";
  const teamCode = typeof args.team === "string" ? args.team.trim().toUpperCase() : "";
  const posRaw = typeof args.pos === "string" ? args.pos.trim().toUpperCase() : "";
  const position = POSITION_ALIASES[posRaw] || posRaw;
  const season = args.season ? Number(args.season) : SEASON_DEFAULT;
  const weeks = parseWeeks(args.weeks);
  const dryRun = args["dry-run"] === true;

  let jerseyNumber = null;
  if (args.jersey != null && args.jersey !== true && args.jersey !== "") {
    jerseyNumber = Number(args.jersey);
    if (!Number.isInteger(jerseyNumber) || jerseyNumber < 0 || jerseyNumber > 99) {
      console.error("Hibás --jersey (0-99 közötti egész szám kell).");
      process.exit(1);
    }
  }

  if (!name) {
    console.error('Hiányzik a --name (pl. --name="Első Játékos").');
    process.exit(1);
  }
  if (!TEAM_CODES.has(teamCode)) {
    console.error(`Ismeretlen vagy hiányzó --team: "${args.team ?? ""}". Érvényes: ${[...TEAM_CODES].sort().join(", ")}`);
    process.exit(1);
  }
  if (!POSITIONS.includes(position)) {
    console.error(`Ismeretlen vagy hiányzó --pos: "${args.pos ?? ""}". Érvényes: ${POSITIONS.join(", ")}`);
    process.exit(1);
  }
  if (!Number.isInteger(season) || season < 2000) {
    console.error("Hibás --season.");
    process.exit(1);
  }
  if (!weeks || !weeks.length) {
    console.error('Hibás --weeks. Példák: --weeks=1-18  vagy  --weeks=7,8,9');
    process.exit(1);
  }

  const split = splitName(name);
  const firstName = typeof args.first === "string" && args.first.trim() ? args.first.trim() : split.firstName;
  const lastName = typeof args.last === "string" && args.last.trim() ? args.last.trim() : split.lastName;

  const slug = slugify(name);
  if (!slug) {
    console.error("A névből nem képezhető azonosító.");
    process.exit(1);
  }

  // Már létező sorok (API-s vagy XLS-es) ugyanezzel a csapat+név párossal, hétenként.
  const sameTeam = await prisma.perfectChallengePlayer.findMany({
    where: { season, teamCode, week: { in: weeks } },
    select: { id: true, week: true, displayName: true, position: true },
  });
  const targetName = normalizeName(name);
  const existingByWeek = new Map();
  for (const row of sameTeam) {
    if (normalizeName(row.displayName) === targetName) existingByWeek.set(row.week, row);
  }

  // Ellenfelek a Game táblából (ugyanúgy, mint az addMissingPlayer.js-ben).
  const neededWeeks = [...new Set(weeks.flatMap((w) => [w - 1, w]))].filter((w) => w > 0);
  const games = await prisma.game.findMany({
    where: { season, gameType: "REG", week: { in: neededWeeks } },
    select: { week: true, homeTeam: true, awayTeam: true },
  });
  const opponentByWeekTeam = {};
  for (const g of games) {
    opponentByWeekTeam[g.week] ||= {};
    opponentByWeekTeam[g.week][g.homeTeam] = g.awayTeam;
    opponentByWeekTeam[g.week][g.awayTeam] = g.homeTeam;
  }

  console.log(`${dryRun ? "[PRÓBAFUTÁS – nem ír az adatbázisba] " : ""}${name} (${teamCode}, ${position}), ${season}, hetek: ${weeks.join(",")}`);

  let created = 0;
  let skipped = 0;

  for (const week of weeks) {
    const found = existingByWeek.get(week);
    if (found) {
      skipped += 1;
      console.log(`  ${week}. hét: már létezik (${found.id}, ${found.position}) – kihagyva.`);
      continue;
    }

    const id = `${season}-${week}-XLS-${teamCode}-${slug}`;

    if (!dryRun) {
      await prisma.perfectChallengePlayer.upsert({
        where: { id },
        update: {},
        create: {
          id,
          season,
          week,
          position,
          teamCode,
          firstName,
          lastName,
          displayName: name,
          headshotUrl: null,
          isDefense: false,
          currentScore: 0,
          avgScore: 0,
          currentWeekOpponentTeam: opponentByWeekTeam[week]?.[teamCode] || null,
          lastWeekOpponentTeam: opponentByWeekTeam[week - 1]?.[teamCode] || null,
          overallStats: {},
          weeklyStats: {},
          jerseyNumber,
          isActive: true,
        },
      });
    }

    created += 1;
    console.log(`  ${week}. hét: ${dryRun ? "létrejönne" : "létrehozva"} → ${id}`);
  }

  console.log(`\nKész. ${dryRun ? "Létrejönne" : "Létrehozva"}: ${created}, kihagyva (már megvolt): ${skipped}.`);
  if (!dryRun && created) {
    console.log("Amint az API visszaadja a játékost ugyanezen a néven és csapatban, a rendszer automatikusan API ID-ra cseréli.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Hiba:", err);
    prisma.$disconnect();
    process.exit(1);
  });