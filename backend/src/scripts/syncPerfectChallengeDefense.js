import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { TEAM_CODE_BY_API_ID } from "../lib/nflTeams.js";

const TEAM_FULL_NAMES = {
  ARI: "Arizona Cardinals",
  ATL: "Atlanta Falcons",
  BAL: "Baltimore Ravens",
  BUF: "Buffalo Bills",
  CAR: "Carolina Panthers",
  CHI: "Chicago Bears",
  CIN: "Cincinnati Bengals",
  CLE: "Cleveland Browns",
  DAL: "Dallas Cowboys",
  DEN: "Denver Broncos",
  DET: "Detroit Lions",
  GB: "Green Bay Packers",
  HOU: "Houston Texans",
  IND: "Indianapolis Colts",
  JAX: "Jacksonville Jaguars",
  KC: "Kansas City Chiefs",
  LV: "Las Vegas Raiders",
  LAC: "Los Angeles Chargers",
  LAR: "Los Angeles Rams",
  MIA: "Miami Dolphins",
  MIN: "Minnesota Vikings",
  NE: "New England Patriots",
  NO: "New Orleans Saints",
  NYG: "New York Giants",
  NYJ: "New York Jets",
  PHI: "Philadelphia Eagles",
  PIT: "Pittsburgh Steelers",
  SF: "San Francisco 49ers",
  SEA: "Seattle Seahawks",
  TB: "Tampa Bay Buccaneers",
  TEN: "Tennessee Titans",
  WAS: "Washington Commanders",
};

async function syncDefense(season, weeks) {
  const teamCodes = [...new Set(Object.values(TEAM_CODE_BY_API_ID))];

  const allWeeksNeeded = [...new Set(weeks.flatMap((w) => [w - 1, w]))].filter((w) => w > 0);
  const games = await prisma.game.findMany({
    where: { season, gameType: "REG", week: { in: allWeeksNeeded } },
  });

  const opponentByWeekTeam = {};
  for (const g of games) {
    opponentByWeekTeam[g.week] ||= {};
    opponentByWeekTeam[g.week][g.homeTeam] = g.awayTeam;
    opponentByWeekTeam[g.week][g.awayTeam] = g.homeTeam;
  }

  let count = 0;
  const totalToWrite = teamCodes.length * weeks.length;

  for (const week of weeks) {
    for (const teamCode of teamCodes) {
      const fullName = TEAM_FULL_NAMES[teamCode] || teamCode;
      const id = `${season}-${week}-DEF-${teamCode}`;
      const currentWeekOpponentTeam = opponentByWeekTeam[week]?.[teamCode] || null;
      const lastWeekOpponentTeam = opponentByWeekTeam[week - 1]?.[teamCode] || null;

      const weeklyStats = {
        interception: 0,
        forcedFumble: 0,
        sack: 0,
        safety: 0,
        returnTD: 0,
        allowedPoints: 0,
      };

      await prisma.perfectChallengePlayer.upsert({
        where: { id },
        update: {
          teamCode,
          displayName: fullName,
          currentWeekOpponentTeam,
          lastWeekOpponentTeam,
          isActive: true,
        },
        create: {
          id,
          season,
          week,
          position: "DEF",
          teamCode,
          firstName: "",
          lastName: fullName,
          displayName: fullName,
          headshotUrl: null,
          isDefense: true,
          currentScore: 0,
          avgScore: 0,
          allowedPassingYards: 0,
          allowedRushingYards: 0,
          currentWeekOpponentTeam,
          lastWeekOpponentTeam,
          overallStats: {},
          weeklyStats,
          isActive: true,
        },
      });

      count++;
      if (count % 100 === 0) console.log(`  ...${count}/${totalToWrite} sor mentve`);
    }
  }

  console.log(`Kész. ${count} DEF sor létrehozva/frissítve.`);
}

const season = Number(process.argv[2]) || new Date().getFullYear();
const weeksArg = process.argv[3];
const weeks = weeksArg
  ? weeksArg.split(",").map(Number)
  : Array.from({ length: 18 }, (_, i) => i + 1);

syncDefense(season, weeks)
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Hiba:", err);
    prisma.$disconnect();
    process.exit(1);
  });