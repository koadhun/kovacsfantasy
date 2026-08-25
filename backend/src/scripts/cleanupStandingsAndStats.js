import "dotenv/config";
import { prisma } from "../lib/prisma.js";

const SEASON = 2026;

async function cleanup() {
  const standingsResult = await prisma.standingsRow.updateMany({
    where: { season: SEASON },
    data: {
      w: 0,
      l: 0,
      t: 0,
      pct: 0,
      pf: 0,
      pa: 0,
      net: 0,
      clinched: [],
    },
  });
  console.log(`Standings nullázva: ${standingsResult.count} csapat-sor (season=${SEASON}).`);

  const playerStatResult = await prisma.playerStat.deleteMany({
    where: { season: SEASON },
  });
  console.log(`PlayerStat törölve: ${playerStatResult.count} rekord (season=${SEASON}).`);

  const playerGameStatResult = await prisma.playerGameStat.deleteMany({
    where: { season: SEASON },
  });
  console.log(`PlayerGameStat törölve: ${playerGameStatResult.count} rekord (season=${SEASON}).`);

  console.log("Kész.");
}

cleanup()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Hiba:", err);
    prisma.$disconnect();
    process.exit(1);
  });