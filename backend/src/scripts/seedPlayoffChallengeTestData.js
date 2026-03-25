import { prisma } from "../lib/prisma.js";
import { buildPlayoffChallengeTestData } from "../data/playoffChallengePlayers.js";

const SEASON = 2025;
const PLAYOFF_GAME_TYPES = ["WC", "DIV", "CONF", "SB"];
const ROUND_ORDER = ["WILDCARD", "DIVISIONAL", "CONFERENCE", "SUPER_BOWL"];

const DEMO_STRATEGIES = [
  {
    name: "full_chain_from_wildcard_byes",
    rounds: {
      WILDCARD: {
        QB: "KC:QB",
        RB1: "KC:RB",
        RB2: "DET:RB",
        WR1: "KC:WR",
        WR2: "DET:WR",
        TE: "KC:TE",
        K: "DET:K",
        DEF: "KC:DEF",
      },
      DIVISIONAL: {
        QB: "KC:QB",
        RB1: "KC:RB",
        RB2: "DET:RB",
        WR1: "KC:WR",
        WR2: "DET:WR",
        TE: "KC:TE",
        K: "DET:K",
        DEF: "KC:DEF",
      },
      CONFERENCE: {
        QB: "KC:QB",
        RB1: "KC:RB",
        RB2: "DET:RB",
        WR1: "KC:WR",
        WR2: "DET:WR",
        TE: "KC:TE",
        K: "DET:K",
        DEF: "KC:DEF",
      },
      SUPER_BOWL: {
        QB: "KC:QB",
        RB1: "KC:RB",
        RB2: "DET:RB",
        WR1: "KC:WR",
        WR2: "DET:WR",
        TE: "KC:TE",
        K: "DET:K",
        DEF: "KC:DEF",
      },
    },
  },
  {
    name: "late_join_chain_from_divisional",
    rounds: {
      WILDCARD: {
        QB: "BUF:QB",
        RB1: "BAL:RB",
        RB2: "PHI:RB",
        WR1: "BUF:WR",
        WR2: "TB:WR",
        TE: "LAR:TE",
        K: "PHI:K",
        DEF: "BAL:DEF",
      },
      DIVISIONAL: {
        QB: "KC:QB",
        RB1: "KC:RB",
        RB2: "DET:RB",
        WR1: "KC:WR",
        WR2: "DET:WR",
        TE: "KC:TE",
        K: "DET:K",
        DEF: "KC:DEF",
      },
      CONFERENCE: {
        QB: "KC:QB",
        RB1: "KC:RB",
        RB2: "DET:RB",
        WR1: "KC:WR",
        WR2: "DET:WR",
        TE: "KC:TE",
        K: "DET:K",
        DEF: "KC:DEF",
      },
      SUPER_BOWL: {
        QB: "KC:QB",
        RB1: "KC:RB",
        RB2: "DET:RB",
        WR1: "KC:WR",
        WR2: "DET:WR",
        TE: "KC:TE",
        K: "DET:K",
        DEF: "KC:DEF",
      },
    },
  },
  {
    name: "mixed_strategy",
    rounds: {
      WILDCARD: {
        QB: "BAL:QB",
        RB1: "BUF:RB",
        RB2: "TB:RB",
        WR1: "PHI:WR",
        WR2: "LAR:WR",
        TE: "BAL:TE",
        K: "BUF:K",
        DEF: "PHI:DEF",
      },
      DIVISIONAL: {
        QB: "BAL:QB",
        RB1: "KC:RB",
        RB2: "DET:RB",
        WR1: "PHI:WR",
        WR2: "LAR:WR",
        TE: "KC:TE",
        K: "DET:K",
        DEF: "BAL:DEF",
      },
      CONFERENCE: {
        QB: "KC:QB",
        RB1: "BAL:RB",
        RB2: "DET:RB",
        WR1: "KC:WR",
        WR2: "LAR:WR",
        TE: "DET:TE",
        K: "KC:K",
        DEF: "DET:DEF",
      },
      SUPER_BOWL: {
        QB: "KC:QB",
        RB1: "KC:RB",
        RB2: "DET:RB",
        WR1: "KC:WR",
        WR2: "DET:WR",
        TE: "DET:TE",
        K: "KC:K",
        DEF: "DET:DEF",
      },
    },
  },
];

function buildPlayerLookup(players) {
  const map = new Map();

  for (const player of players) {
    map.set(`${player.round}:${player.playerKey}`, player);
  }

  return map;
}

async function seedDemoRosters(players) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    take: DEMO_STRATEGIES.length,
    select: {
      id: true,
      username: true,
    },
  });

  if (!users.length) {
    console.log("No users found, demo playoff rosters skipped.");
    return;
  }

  const playerLookup = buildPlayerLookup(players);

  for (let index = 0; index < users.length; index += 1) {
    const user = users[index];
    const strategy = DEMO_STRATEGIES[index];

    for (const round of ROUND_ORDER) {
      const roster = await prisma.playoffChallengeRoster.create({
        data: {
          userId: user.id,
          season: SEASON,
          round,
        },
      });

      const selections = strategy.rounds[round] || {};

      for (const [slot, playerKey] of Object.entries(selections)) {
        const player = playerLookup.get(`${round}:${playerKey}`);
        if (!player) continue;

        await prisma.playoffChallengeRosterSlot.create({
          data: {
            rosterId: roster.id,
            slot,
            playerId: player.id,
          },
        });
      }
    }

    console.log(`Seeded demo playoff rosters for ${user.username} (${strategy.name}).`);
  }
}

async function main() {
  const { games, players } = buildPlayoffChallengeTestData(SEASON);

  await prisma.playoffChallengeRosterSlot.deleteMany({
    where: {
      roster: {
        season: SEASON,
      },
    },
  });

  await prisma.playoffChallengeRoster.deleteMany({
    where: {
      season: SEASON,
    },
  });

  await prisma.playoffChallengePlayer.deleteMany({
    where: {
      season: SEASON,
    },
  });

  await prisma.game.deleteMany({
    where: {
      season: SEASON,
      gameType: {
        in: PLAYOFF_GAME_TYPES,
      },
    },
  });

  const createdGameMap = new Map();

  for (const game of games) {
    const { key, ...data } = game;

    const created = await prisma.game.create({
      data,
    });

    createdGameMap.set(key, created);
  }

  const createdPlayers = [];

  for (const player of players) {
    const { gameKey, ...data } = player;

    const created = await prisma.playoffChallengePlayer.create({
      data: {
        ...data,
        gameId: createdGameMap.get(gameKey)?.id || null,
      },
    });

    createdPlayers.push(created);
  }

  await seedDemoRosters(createdPlayers);

  console.log(
    `Seed complete: ${games.length} playoff games, ${createdPlayers.length} playoff players.`
  );
}

main()
  .catch((error) => {
    console.error("seedPlayoffChallengeTestData failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });