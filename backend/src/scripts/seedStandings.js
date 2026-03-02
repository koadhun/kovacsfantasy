import { prisma } from "../lib/prisma.js";
import { STANDINGS_2025 } from "../data/standingsSeed2025.js";

function toClinchFlags(arr = []) {
  return arr.map((c) => (c === "*" ? "STAR" : c));
}

async function main() {
  const { season, conferences } = STANDINGS_2025;

  // töröljük az adott szezon standings sorait (újratölthető seed)
  await prisma.standingsRow.deleteMany({ where: { season } });

  const rows = [];

  for (const conf of ["AFC", "NFC"]) {
    const divs = conferences[conf].divisions;
    for (const divisionName of Object.keys(divs)) {
      for (const r of divs[divisionName]) {
        rows.push({
          season,
          conference: conf,
          division: divisionName,
          team: r.team,
          w: r.w,
          l: r.l,
          t: r.t,
          pct: r.pct,
          pf: r.pf,
          pa: r.pa,
          net: r.net,
          clinched: toClinchFlags(r.clinched || [])
        });
      }
    }
  }

  await prisma.standingsRow.createMany({ data: rows });
  console.log(`Seed complete: ${rows.length} standings rows inserted for season ${season}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });