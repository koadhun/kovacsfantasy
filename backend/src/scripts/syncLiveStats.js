import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { teamCodeFromApiId } from "../lib/nflTeams.js";
import { ACTIVE_GAME_TYPE } from "../lib/activeGameType.js";

const API_BASE = "https://v1.american-football.api-sports.io";

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseSplit(value) {
  if (value == null) return [0, 0];
  const m = /^(-?\d+)[\/\-](-?\d+)$/.exec(String(value));
  if (!m) return [0, 0];
  return [Number(m[1]), Number(m[2])];
}

function statMap(statistics = []) {
  const m = {};
  for (const s of statistics) m[s.name] = s.value;
  return m;
}

async function fetchGameBoxscoreRaw(apiGameId) {
  const res = await fetch(`${API_BASE}/games/statistics/players?id=${apiGameId}`, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(JSON.stringify(data.errors));
  }
  return data.response || [];
}

function extractGameSnapshots(teamsStats) {
  const snapshots = [];

  for (const teamBlock of teamsStats) {
    const teamCode = teamCodeFromApiId(teamBlock.team?.id) || teamBlock.team?.name;

    for (const group of teamBlock.groups || []) {
      for (const p of group.players || []) {
        const apiPlayerId = p.player?.id;
        const playerName = p.player?.name;
        if (!apiPlayerId || !playerName) continue;
        const s = statMap(p.statistics);

        if (group.name === "Passing") {
          const [cmp, att] = parseSplit(s["comp att"]);
          const [sck, sckY] = parseSplit(s["sacks"]);
          snapshots.push({
            category: "passing", apiPlayerId, playerName, team: teamCode,
            stats: {
              cmp, att, passYds: num(s["yards"]), td: num(s["passing touch downs"]),
              int: num(s["interceptions"]), sck, sckY, rating: num(s["rating"]),
            },
          });
        }

        if (group.name === "Rushing") {
          snapshots.push({
            category: "rushing", apiPlayerId, playerName, team: teamCode,
            stats: {
              att: num(s["total rushes"]), rushYds: num(s["yards"]),
              td: num(s["rushing touch downs"]), lng: num(s["longest rush"]),
            },
          });
        }

        if (group.name === "Receiving") {
          snapshots.push({
            category: "receiving", apiPlayerId, playerName, team: teamCode,
            stats: {
              tgt: num(s["targets"]), rec: num(s["total receptions"]),
              yds: num(s["yards"]), td: num(s["receiving touch downs"]),
              lng: num(s["longest reception"]),
            },
          });
        }

        if (group.name === "Fumbles") {
          snapshots.push({
            category: "fumbles", apiPlayerId, playerName, team: teamCode,
            stats: { fum: num(s["total"]), lost: num(s["lost"]), ownRec: num(s["rec"]) },
          });
        }

        if (group.name === "Defensive") {
          snapshots.push({
            category: "tackles", apiPlayerId, playerName, team: teamCode,
            stats: {
              comb: num(s["tackles"]), solo: num(s["unassisted tackles"]),
              tfl: num(s["tfl"]), qbHits: num(s["qb hts"]),
              sacks: num(s["sacks"]), ff: num(s["ff"]),
              intTd: num(s["interceptions for touch downs"]),
            },
          });
        }

        if (group.name === "Kicking") {
          const [fgm, fga] = parseSplit(s["field goals"]);
          const [xpm, xpa] = parseSplit(s["extra point"]);
          const fg0to49 =
            num(s["field goals from 1 19 yards"]) +
            num(s["field goals from 20 29 yards"]) +
            num(s["field goals from 30 39 yards"]) +
            num(s["field goals from 40 49 yards"]);
          const fg50plus = num(s["field goals from 50 yards"]);
          snapshots.push({
            category: "field_goals", apiPlayerId, playerName, team: teamCode,
            stats: { fgm, fga, xpm, xpa, pts: num(s["points"]), long: num(s["long"]), fg0to49, fg50plus },
          });
        }

        if (group.name === "Kick_returns") {
          snapshots.push({
            category: "kickoff_returns", apiPlayerId, playerName, team: teamCode,
            stats: {
              ret: num(s["total"]), yds: num(s["yards"]),
              td: num(s["kick return td"]), lng: num(s["lg"]),
            },
          });
        }

        if (group.name === "Punting") {
          snapshots.push({
            category: "punting", apiPlayerId, playerName, team: teamCode,
            stats: {
              punts: num(s["total"]), yds: num(s["yards"]),
              tb: num(s["touchbacks"]), in20: num(s["in20"]), lng: num(s["lg"]),
            },
          });
        }
      }
    }
  }

  return snapshots;
}

async function sumCategoryRows(season, apiPlayerId, category) {
  const rows = await prisma.playerGameStat.findMany({
    where: { season, apiPlayerId, category },
  });

  const sums = {};
  let maxLng = 0;
  const ratings = [];
  let playerName = "";
  let team = "";

  for (const row of rows) {
    playerName = row.playerName;
    team = row.team;
    const st = row.stats;
    for (const [k, v] of Object.entries(st)) {
      if (k === "lng" || k === "long") {
        maxLng = Math.max(maxLng, num(v));
      } else if (k === "rating") {
        ratings.push(num(v));
      } else {
        sums[k] = (sums[k] || 0) + num(v);
      }
    }
  }

  return { sums, maxLng, ratings, playerName, team, gamesCount: rows.length };
}

async function recomputePlayerStat(season, apiPlayerId, category) {
  const { sums, maxLng, ratings, playerName, team, gamesCount } =
    await sumCategoryRows(season, apiPlayerId, category);

  if (gamesCount === 0) return;

  let fumCrossRef = 0;
  if (["rushing", "receiving", "tackles"].includes(category)) {
    const fumSums = await sumCategoryRows(season, apiPlayerId, "fumbles");
    fumCrossRef = category === "tackles" ? (fumSums.sums.ownRec || 0) : (fumSums.sums.fum || 0);
  }

  let stats;
  switch (category) {
    case "passing": {
      const cmp = sums.cmp || 0, att = sums.att || 0;
      stats = {
        player: playerName, passYds: sums.passYds || 0, att, cmp,
        cmpPct: att ? Math.round((cmp / att) * 1000) / 10 : 0,
        ydsAtt: att ? Math.round(((sums.passYds || 0) / att) * 10) / 10 : 0,
        td: sums.td || 0, int: sums.int || 0,
        rate: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0,
        first: 0, firstPct: 0, "20+": 0, "40+": 0, lng: 0,
        sck: sums.sck || 0, sckY: sums.sckY || 0,
      };
      break;
    }
    case "rushing": {
      const att = sums.att || 0;
      stats = {
        player: playerName, rushYds: sums.rushYds || 0, att,
        ydsAtt: att ? Math.round(((sums.rushYds || 0) / att) * 10) / 10 : 0,
        td: sums.td || 0, first: 0, firstPct: 0, "20+": 0, "40+": 0,
        lng: maxLng, fum: fumCrossRef,
      };
      break;
    }
    case "receiving": {
      const rec = sums.rec || 0;
      stats = {
        player: playerName, rec, tgt: sums.tgt || 0, yds: sums.yds || 0,
        ydsRec: rec ? Math.round(((sums.yds || 0) / rec) * 10) / 10 : 0,
        td: sums.td || 0, first: 0, firstPct: 0, "20+": 0, "40+": 0,
        lng: maxLng, fum: fumCrossRef,
      };
      break;
    }
    case "fumbles": {
      stats = {
        player: playerName, fum: sums.fum || 0, lost: sums.lost || 0,
        oob: 0, forced: 0, ownRec: sums.ownRec || 0, oppRec: 0,
      };
      break;
    }
    case "tackles": {
      const comb = sums.comb || 0, solo = sums.solo || 0;
      stats = {
        player: playerName, comb, solo, ast: Math.max(0, comb - solo),
        tfl: sums.tfl || 0, qbHits: sums.qbHits || 0, sacks: sums.sacks || 0,
        ff: sums.ff || 0, fr: fumCrossRef,
      };
      break;
    }
    case "field_goals": {
      const fgm = sums.fgm || 0, fga = sums.fga || 0;
      stats = {
        player: playerName, fgm, fga,
        pct: fga ? Math.round((fgm / fga) * 1000) / 10 : 0,
        lng: maxLng, xpm: sums.xpm || 0, xpa: sums.xpa || 0, pts: sums.pts || 0,
      };
      break;
    }
    case "kickoff_returns": {
      const ret = sums.ret || 0;
      stats = {
        player: playerName, ret, yds: sums.yds || 0,
        avg: ret ? Math.round(((sums.yds || 0) / ret) * 10) / 10 : 0,
        td: sums.td || 0, lng: maxLng,
      };
      break;
    }
    case "punting": {
      const punts = sums.punts || 0;
      stats = {
        player: playerName, punts, yds: sums.yds || 0,
        avg: punts ? Math.round(((sums.yds || 0) / punts) * 10) / 10 : 0,
        net: 0, lng: maxLng, in20: sums.in20 || 0, tb: sums.tb || 0,
      };
      break;
    }
    default:
      return;
  }

  await prisma.playerStat.upsert({
    where: { season_category_apiPlayerId: { season, category, apiPlayerId } },
    update: { playerName, team, stats },
    create: { season, category, apiPlayerId, playerName, team, stats },
  });
}

export async function syncLiveStats(season) {
  const dirtyGames = await prisma.game.findMany({
    where: {
      season,
      gameType: ACTIVE_GAME_TYPE,
      OR: [
        { status: "IN_PROGRESS" },
        { status: "FINAL", statsSynced: false },
      ],
    },
  });

  if (!dirtyGames.length) {
    console.log(`[live-stats] Nincs frissitendo meccs.`);
    return { gamesProcessed: 0, playersUpdated: 0 };
  }

  console.log(`[live-stats] ${dirtyGames.length} meccs statisztikajat frissitjuk...`);

  const touched = new Set();

  for (const game of dirtyGames) {
    if (!game.apiGameId) continue;

    let teamsStats;
    try {
      teamsStats = await fetchGameBoxscoreRaw(game.apiGameId);
    } catch (err) {
      console.warn(`  Hiba a ${game.apiGameId} meccsnel: ${err.message}`);
      continue;
    }

    const snapshots = extractGameSnapshots(teamsStats);

    for (const snap of snapshots) {
      const id = `${season}-${game.apiGameId}-${snap.category}-${snap.apiPlayerId}`;
      await prisma.playerGameStat.upsert({
        where: {
          season_apiGameId_category_apiPlayerId: {
            season, apiGameId: game.apiGameId, category: snap.category, apiPlayerId: snap.apiPlayerId,
          },
        },
        update: { playerName: snap.playerName, team: snap.team, stats: snap.stats, week: game.week },
        create: {
          id, season, week: game.week, apiGameId: game.apiGameId,
          category: snap.category, apiPlayerId: snap.apiPlayerId,
          playerName: snap.playerName, team: snap.team, stats: snap.stats,
        },
      });
      touched.add(`${snap.category}|${snap.apiPlayerId}`);
    }

    if (game.status === "FINAL") {
      await prisma.game.update({ where: { id: game.id }, data: { statsSynced: true } });
    }
  }

  console.log(`[live-stats] ${touched.size} jatekos-kategoria erintett, osszesites ujraszamolasa...`);

  for (const key of touched) {
    const [category, apiPlayerIdStr] = key.split("|");
    await recomputePlayerStat(season, Number(apiPlayerIdStr), category);
  }

  console.log(`[live-stats] Kesz.`);
  return { gamesProcessed: dirtyGames.length, playersUpdated: touched.size };
}

if (process.argv[1] && process.argv[1].endsWith("syncLiveStats.js")) {
  const season = Number(process.argv[2]) || new Date().getFullYear();
  syncLiveStats(season)
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error("Hiba:", err);
      prisma.$disconnect();
      process.exit(1);
    });
}