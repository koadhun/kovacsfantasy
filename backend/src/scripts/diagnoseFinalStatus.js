import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function main() {
  const season = Number(process.argv[2]) || 2025;

  const notFinal = await prisma.game.findMany({
    where: { season, gameType: "REG", status: { not: "FINAL" } },
    select: { week: true, homeTeam: true, awayTeam: true, kickoffAt: true, status: true }
  });

  console.log(`Nem FINAL státuszú alapszakasz-meccsek (${season}): ${notFinal.length} db`);
  for (const g of notFinal) {
    console.log(`  Week ${g.week}: ${g.homeTeam} vs ${g.awayTeam} - ${g.kickoffAt.toISOString().slice(0,10)} - status: ${g.status}`);
  }

  await prisma.$disconnect();
}

main();