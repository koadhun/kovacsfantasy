import { PrismaClient } from "@prisma/client";
import {
  buildPerfectChallengeTestData,
} from "../data/perfectChallengePlayers.js";

const prisma = new PrismaClient();

async function main() {
  const season = 2025;
  const weeks = [1, 2, 3];
  const { games, players } = buildPerfectChallengeTestData(new Date());

  await prisma.$transaction(async (tx) => {
    await tx.perfectChallengeRosterSlot.deleteMany({
      where: {
        roster: {
          season,
          week: { in: weeks },
        },
      },
    });

    await tx.perfectChallengeRoster.deleteMany({
      where: {
        season,
        week: { in: weeks },
      },
    });

    await tx.perfectChallengePlayer.deleteMany({
      where: {
        season,
        week: { in: weeks },
      },
    });

    await tx.game.deleteMany({
      where: {
        season,
        week: { in: weeks },
      },
    });

    await tx.game.createMany({
      data: games,
    });

    await tx.perfectChallengePlayer.createMany({
      data: players,
    });
  });

  console.log(
    `Seed completed: ${games.length} games and ${players.length} perfect challenge players inserted.`
  );
}

main()
  .catch((error) => {
    console.error("Perfect Challenge test seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });