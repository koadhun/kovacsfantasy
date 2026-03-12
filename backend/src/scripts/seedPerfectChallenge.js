import { prisma } from "../lib/prisma.js";

const SEASON = 2025;

const players = [
  {
    season: SEASON,
    position: "QB",
    teamCode: "BUF",
    firstName: "Josh",
    lastName: "Allen",
    headshotUrl: "https://static.www.nfl.com/image/private/t_headshot_desktop/league/sb8whj4z5m8q4rj2sqiy",
    currentScore: 24.8,
    overallStats: {
      passingYards: 3285.2,
      passingTDs: 27,
      interceptions: 9,
      rushingYards: 421.4,
      rushingTDs: 6,
      fumble: 2,
    },
    weeklyStats: {
      passingYards: 325.2,
      passingTDs: 4,
      interceptions: 1,
      rushingYards: 15.2,
      rushingTDs: 0,
      fumble: 0,
    },
  },
  {
    season: SEASON,
    position: "QB",
    teamCode: "KC",
    firstName: "Patrick",
    lastName: "Mahomes",
    headshotUrl: "https://static.www.nfl.com/image/private/t_headshot_desktop/league/qw9fzh4usx1dx3vgtpga",
    currentScore: 22.1,
    overallStats: {
      passingYards: 3176.9,
      passingTDs: 24,
      interceptions: 8,
      rushingYards: 236.4,
      rushingTDs: 2,
      fumble: 1,
    },
    weeklyStats: {
      passingYards: 286.7,
      passingTDs: 3,
      interceptions: 0,
      rushingYards: 21.5,
      rushingTDs: 1,
      fumble: 0,
    },
  },

  {
    season: SEASON,
    position: "RB",
    teamCode: "SF",
    firstName: "Christian",
    lastName: "McCaffrey",
    headshotUrl: "https://static.www.nfl.com/image/private/t_headshot_desktop/league/jl8ahwht6tmivuxqzqdg",
    currentScore: 19.6,
    overallStats: {
      rushingYards: 1184.2,
      rushingTDs: 11,
      receivedYards: 412.5,
      receivedTDs: 4,
      fumble: 1,
    },
    weeklyStats: {
      rushingYards: 95.6,
      rushingTDs: 1,
      receivedYards: 42.3,
      receivedTDs: 1,
      fumble: 0,
    },
  },
  {
    season: SEASON,
    position: "RB",
    teamCode: "DET",
    firstName: "Jahmyr",
    lastName: "Gibbs",
    headshotUrl: "https://static.www.nfl.com/image/private/t_headshot_desktop/league/krg0q5e4ybxkschjwhdx",
    currentScore: 16.4,
    overallStats: {
      rushingYards: 902.8,
      rushingTDs: 8,
      receivedYards: 356.2,
      receivedTDs: 3,
      fumble: 0,
    },
    weeklyStats: {
      rushingYards: 78.1,
      rushingTDs: 1,
      receivedYards: 50.5,
      receivedTDs: 1,
      fumble: 0,
    },
  },
  {
    season: SEASON,
    position: "RB",
    teamCode: "NO",
    firstName: "Cam",
    lastName: "Ingram",
    headshotUrl: "https://static.www.nfl.com/image/private/t_headshot_desktop/league/owjd2u0z6ru2nypgvtmx",
    currentScore: 8.2,
    overallStats: {
      rushingYards: 644.1,
      rushingTDs: 5,
      receivedYards: 188.7,
      receivedTDs: 1,
      fumble: 1,
    },
    weeklyStats: {
      rushingYards: 48.9,
      rushingTDs: 0,
      receivedYards: 19.4,
      receivedTDs: 0,
      fumble: 1,
    },
  },

  {
    season: SEASON,
    position: "WR",
    teamCode: "MIA",
    firstName: "Tyreek",
    lastName: "Hill",
    headshotUrl: "https://static.www.nfl.com/image/private/t_headshot_desktop/league/df3s3j4w7kqf4m0o5q8r",
    currentScore: 18.5,
    overallStats: {
      receivedYards: 1322.5,
      receivedTDs: 10,
      rushingYards: 41.2,
      rushingTDs: 1,
      fumbles: 1,
    },
    weeklyStats: {
      receivedYards: 108.5,
      receivedTDs: 1,
      rushingYards: 6.2,
      rushingTDs: 0,
      fumbles: 0,
    },
  },
  {
    season: SEASON,
    position: "WR",
    teamCode: "DAL",
    firstName: "CeeDee",
    lastName: "Lamb",
    headshotUrl: "https://static.www.nfl.com/image/private/t_headshot_desktop/league/j0hyn9w5w6byh9vxqth8",
    currentScore: 17.9,
    overallStats: {
      receivedYards: 1288.3,
      receivedTDs: 9,
      rushingYards: 22.4,
      rushingTDs: 0,
      fumbles: 0,
    },
    weeklyStats: {
      receivedYards: 97.6,
      receivedTDs: 1,
      rushingYards: 4.3,
      rushingTDs: 0,
      fumbles: 0,
    },
  },
  {
    season: SEASON,
    position: "WR",
    teamCode: "CAR",
    firstName: "Kelvin",
    lastName: "Benjamin",
    headshotUrl: "https://static.www.nfl.com/image/private/t_headshot_desktop/league/yrk6rj3byc2hfa7b5cxe",
    currentScore: 6.7,
    overallStats: {
      receivedYards: 611.6,
      receivedTDs: 4,
      rushingYards: 9.5,
      rushingTDs: 0,
      fumbles: 1,
    },
    weeklyStats: {
      receivedYards: 43.8,
      receivedTDs: 0,
      rushingYards: 2.0,
      rushingTDs: 0,
      fumbles: 1,
    },
  },

  {
    season: SEASON,
    position: "TE",
    teamCode: "NO",
    firstName: "Jimmy",
    lastName: "Graham",
    headshotUrl: "https://static.www.nfl.com/image/private/t_headshot_desktop/league/s6wn6gijv3t6x7r0v9qx",
    currentScore: 14.6,
    overallStats: {
      receivedYards: 702.4,
      receivedTDs: 7,
      rushingYards: 0.0,
      rushingTDs: 0,
      fumbles: 0,
    },
    weeklyStats: {
      receivedYards: 56.4,
      receivedTDs: 1,
      rushingYards: 0.0,
      rushingTDs: 0,
      fumbles: 0,
    },
  },
  {
    season: SEASON,
    position: "TE",
    teamCode: "KC",
    firstName: "Travis",
    lastName: "Kelce",
    headshotUrl: "https://static.www.nfl.com/image/private/t_headshot_desktop/league/yy4ax1xihm8kwv4n4h9a",
    currentScore: 13.2,
    overallStats: {
      receivedYards: 884.9,
      receivedTDs: 6,
      rushingYards: 0.0,
      rushingTDs: 0,
      fumbles: 0,
    },
    weeklyStats: {
      receivedYards: 68.9,
      receivedTDs: 1,
      rushingYards: 0.0,
      rushingTDs: 0,
      fumbles: 0,
    },
  },

  {
    season: SEASON,
    position: "K",
    teamCode: "CAR",
    firstName: "Graham",
    lastName: "Gano",
    headshotUrl: "https://static.www.nfl.com/image/private/t_headshot_desktop/league/ugntqz8u8rj9o7c7o9ji",
    currentScore: 7.3,
    overallStats: {
      fg0to49Yards: 18,
      fg50plusYards: 4,
      xp: 29,
    },
    weeklyStats: {
      fg0to49Yards: 3,
      fg50plusYards: 1,
      xp: 5,
    },
  },
  {
    season: SEASON,
    position: "K",
    teamCode: "BAL",
    firstName: "Justin",
    lastName: "Tucker",
    headshotUrl: "https://static.www.nfl.com/image/private/t_headshot_desktop/league/yrh3wdclx8p8wz0tqeq7",
    currentScore: 9.1,
    overallStats: {
      fg0to49Yards: 22,
      fg50plusYards: 6,
      xp: 31,
    },
    weeklyStats: {
      fg0to49Yards: 2,
      fg50plusYards: 1,
      xp: 4,
    },
  },

  {
    season: SEASON,
    position: "DEF",
    teamCode: "NO",
    firstName: "New Orleans",
    lastName: "Saints",
    displayName: "New Orleans Saints",
    isDefense: true,
    headshotUrl: null,
    currentScore: 6.8,
    overallStats: {
      interception: 8,
      forcedFumble: 7,
      sack: 31,
      safety: 1,
      returnTD: 2,
      allowedPoints: 24,
    },
    weeklyStats: {
      interception: 2,
      forcedFumble: 1,
      sack: 4,
      safety: 0,
      returnTD: 1,
      allowedPoints: 24,
    },
  },
  {
    season: SEASON,
    position: "DEF",
    teamCode: "BUF",
    firstName: "Buffalo",
    lastName: "Bills",
    displayName: "Buffalo Bills",
    isDefense: true,
    headshotUrl: null,
    currentScore: 8.4,
    overallStats: {
      interception: 10,
      forcedFumble: 6,
      sack: 35,
      safety: 0,
      returnTD: 1,
      allowedPoints: 19,
    },
    weeklyStats: {
      interception: 1,
      forcedFumble: 2,
      sack: 5,
      safety: 0,
      returnTD: 0,
      allowedPoints: 17,
    },
  },
];

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
    data: players,
  });

  console.log(`Inserted ${players.length} Perfect Challenge players for season ${SEASON}.`);
}

main()
  .catch((err) => {
    console.error("Perfect Challenge seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });