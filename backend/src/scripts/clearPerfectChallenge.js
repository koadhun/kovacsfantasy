import { prisma } from "../lib/prisma.js";

async function main() {
  await prisma.perfectChallengeRosterSlot.deleteMany();
  await prisma.perfectChallengeRoster.deleteMany();
  await prisma.perfectChallengePlayer.deleteMany();

  console.log("Perfect Challenge tables cleared.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });