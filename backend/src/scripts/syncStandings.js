import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { TEAM_CONFERENCE_DIVISION } from "../lib/nflTeams.js";

async function computeStandings(season) {
  const games = await prisma.game.findMany({
    where: { season, gameType: "REG", status: "FINAL" }
  });

  const table = {};
  for (const code of Object.keys(TEAM_CONFERENCE_DIVISION)) {
    table[code] = { w: 0, l: 0, t: 0, pf: 0, pa: 0 };
  }

  for (const g of games) {
    if (g.homeScore == null || g.awayScore == null) continue;
    const home = table[g.homeTeam];
    const away = table[g.awayTeam];
    if (!home || !away) continue;

    home.pf += g.homeScore;
    home.pa += g.awayScore;
    away.pf += g.awayScore;
    away.pa += g.homeScore;

    if (g.homeScore > g.awayScore) {
      home.w++; away.l++;
    } else if (g.homeScore < g.awayScore) {
      away.w++; home.l++;
    } else {
      home.t++; away.t++;
    }
  }

  return table;
}

async function syncStandings(season) {
  console.log(`Tabella számítása a ${season} szezonra a Game adatokból...`);
  const table = await computeStandings(season);

  let count = 0;
  for (const [team, stats] of Object.entries(table)) {
    const { conference, division } = TEAM_CONFERENCE_DIVISION[team];
    const totalGames = stats.w + stats.l + stats.t;
    const pct = totalGames > 0 ? (stats.w + stats.t * 0.5) / totalGames : 0;
    const net = stats.pf - stats.pa;

    await prisma.standingsRow.upsert({
      where: {
        season_conference_division_team: { season, conference, division, team }
      },
      update: {
        w: stats.w, l: stats.l, t: stats.t,
        pct, pf: stats.pf, pa: stats.pa, net
      },
      create: {
        season, conference, division, team,
        w: stats.w, l: stats.l, t: stats.t,
        pct, pf: stats.pf, pa: stats.pa, net,
        clinched: []
      }
    });
    count++;
  }

  console.log(`Kész, ${count} csapat tabellasora frissült/létrejött.`);
}

const season = Number(process.argv[2]) || new Date().getFullYear();
syncStandings(season)
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Hiba:", err);
    prisma.$disconnect();
    process.exit(1);
  });