import "dotenv/config";
import { prisma } from "../lib/prisma.js";

const SEASON = 2026;

async function cleanup() {
  const result = await prisma.perfectChallengePlayer.updateMany({
    where: { season: SEASON },
    data: {
      currentScore: 0,
      avgScore: 0,
      weeklyStats: {},
      overallStats: {},
      allowedPassingYards: null,
      allowedRushingYards: null,
    },
  });

  console.log(`PerfectChallengePlayer statjai nullázva: ${result.count} rekord (season=${SEASON}).`);
}

cleanup()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Hiba:", err);
    prisma.$disconnect();
    process.exit(1);
  });