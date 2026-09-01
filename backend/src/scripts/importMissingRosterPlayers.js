import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../lib/prisma.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SEASON = 2026;
const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // ékezetek eltávolítása
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(name) {
  return normalizeName(name).replace(/\s+/g, "-");
}

async function importMissingPlayers() {
  const dataPath = path.join(__dirname, "data", "fullRosterImport.json");
  const excelPlayers = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  console.log(`Excel-ből beolvasva: ${excelPlayers.length} releváns (QB/RB/WR/TE/K) játékos.`);

  // Csoportosítás team+pozíció szerint, hogy csapatonként/pozíciónként egyszer
  // kérdezzük le, kik szerepelnek már az adatbázisban (bármelyik héten).
  const byTeamPosition = new Map();
  for (const p of excelPlayers) {
    const key = `${p.teamCode}::${p.position}`;
    if (!byTeamPosition.has(key)) byTeamPosition.set(key, []);
    byTeamPosition.get(key).push(p);
  }

  let totalInserted = 0;
  let totalSkippedExisting = 0;

  for (const [key, group] of byTeamPosition.entries()) {
    const [teamCode, position] = key.split("::");

    const existing = await prisma.perfectChallengePlayer.findMany({
      where: { season: SEASON, teamCode, position },
      select: { displayName: true },
    });

    const existingNames = new Set(
      existing.map((e) => normalizeName(e.displayName))
    );

    const missing = group.filter(
      (p) => !existingNames.has(normalizeName(p.displayName))
    );

    if (!missing.length) continue;

    for (const p of missing) {
      const slug = slugify(p.displayName);

      for (const week of WEEKS) {
        const id = `${SEASON}-${week}-XLS-${teamCode}-${slug}`;

        await prisma.perfectChallengePlayer.upsert({
          where: { id },
          update: {},
          create: {
            id,
            season: SEASON,
            week,
            position: p.position,
            teamCode: p.teamCode,
            firstName: p.firstName,
            lastName: p.lastName,
            displayName: p.displayName,
            headshotUrl: null,
            isDefense: false,
            currentScore: 0,
            avgScore: 0,
            overallStats: {},
            weeklyStats: {},
            jerseyNumber: p.jerseyNumber,
            isActive: true,
          },
        });
      }

      totalInserted += 1;
      console.log(`+ Hozzáadva: ${p.displayName} (${p.teamCode}, ${p.position}) - mind a 18 hétre.`);
    }

    totalSkippedExisting += group.length - missing.length;
  }

  console.log("\n--- Összegzés ---");
  console.log(`Új játékos (API-ból eddig hiányzó, most hozzáadva): ${totalInserted}`);
  console.log(`Kihagyva (már szerepelt az API-ból): ${totalSkippedExisting}`);
  console.log("Kész.");
}

importMissingPlayers()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Hiba:", err);
    prisma.$disconnect();
    process.exit(1);
  });