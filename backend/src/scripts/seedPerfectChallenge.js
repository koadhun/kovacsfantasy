import { prisma } from "../lib/prisma.js";
import { perfectChallengePlayers } from "../data/perfectChallengePlayers.js";

const SEASON = 2025;

async function main() {
  console.log("Seeding Perfect Challenge dummy players...");

  await prisma.perfectChallengeRosterSlot.deleteMany();
  await prisma.perfectChallengeRoster.deleteMany({
    where: { season: SEASON },
  });
  await prisma.perfectChallengePlayer.deleteMany({
    where: { season: SEASON },
  });

  await prisma.perfectChallengePlayer.createMany({
    data: perfectChallengePlayers,
  });

  console.log(
    `Inserted ${perfectChallengePlayers.length} Perfect Challenge players for season ${SEASON}.`
  );
}

main()
  .catch((err) => {
    console.error("Perfect Challenge seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });