import { prisma } from "../lib/prisma.js";

const season = 2025;

// Demo Week 1 pár meccs (2 final + 2 future)
const WEEK_1 = [
  {
    season, week: 1, gameType: "REG",
    kickoffAt: new Date("2025-09-07T17:00:00.000Z"),
    homeTeam: "DET", awayTeam: "LAR",
    homeScore: 24, awayScore: 17,
    status: "FINAL",
  },
  {
    season, week: 1, gameType: "REG",
    kickoffAt: new Date("2025-09-07T20:25:00.000Z"),
    homeTeam: "KC", awayTeam: "SF",
    homeScore: 31, awayScore: 28,
    status: "FINAL",
  },
  {
    season, week: 1, gameType: "REG",
    kickoffAt: new Date("2025-09-08T00:20:00.000Z"),
    homeTeam: "PHI", awayTeam: "DAL",
    homeScore: null, awayScore: null,
    status: "SCHEDULED",
  },
  {
    season, week: 1, gameType: "REG",
    kickoffAt: new Date("2025-09-09T00:15:00.000Z"),
    homeTeam: "BUF", awayTeam: "NYJ",
    homeScore: null, awayScore: null,
    status: "SCHEDULED",
  }
];

// Demo Week 2 pár meccs
const WEEK_2 = [
  {
    season, week: 2, gameType: "REG",
    kickoffAt: new Date("2025-09-14T17:00:00.000Z"),
    homeTeam: "LAR", awayTeam: "SF",
    homeScore: null, awayScore: null,
    status: "SCHEDULED",
  },
  {
    season, week: 2, gameType: "REG",
    kickoffAt: new Date("2025-09-14T20:25:00.000Z"),
    homeTeam: "DAL", awayTeam: "DET",
    homeScore: null, awayScore: null,
    status: "SCHEDULED",
  }
];

async function main() {
  // töröljük csak a 2025-öt (demo)
  await prisma.game.deleteMany({ where: { season } });

  await prisma.game.createMany({ data: [...WEEK_1, ...WEEK_2] });

  console.log("Schedule seed complete");
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });