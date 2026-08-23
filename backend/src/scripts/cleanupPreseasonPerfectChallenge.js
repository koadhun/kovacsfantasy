import "dotenv/config";
import { prisma } from "../lib/prisma.js";

const SEASON = 2026;

async function cleanup() {
  const result = await prisma.perfectChallengeRoster.deleteMany({
    where: { season: SEASON },
  });

  console.log(`Törölve: ${result.count} Perfect Challenge roster (season=${SEASON}). A hozzájuk tartozó slotok is törlődtek (cascade).`);
}

cleanup()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Hiba:", err);
    prisma.$disconnect();
    process.exit(1);
  });