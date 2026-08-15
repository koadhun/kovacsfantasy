import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { teamCodeFromApiId } from "../lib/nflTeams.js";

const LEAGUE_ID = 1;
const API_BASE = "https://v1.american-football.api-sports.io";

function parseSplit(value) {
  // "19/23" vagy "1-8" formátumot bont ketté [a, b]-re
  if (value == null) return [0, 0];
  const m = /^(-?\d+)[\/\-](-?\d+)$/.exec(String(value));
  if (!m) return [0, 0];
  return [Number(m[1]), Number(m[2])];
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function statMap(statistics = []) {
  const m = {};
  for (const s of statistics) m[s.name] = s.value;
  return m;
}

async function fetchSeasonGames(season) {
  const res = await fetch(`${API_BASE}/games?league=${LEAGUE_ID}&season=${season}`, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY }
  });
  const data = await res.json();
  return (data.response || []).filter(
    (g) =>
      g.game?.stage === "Regular Season" &&
      ["FT", "AOT"].includes(g.game?.status?.short)
  );
}

async function fetchGameStats(gameId) {
  const res = await fetch(`${API_BASE}/games/statistics/players?id=${gameId}`, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY }
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(JSON.stringify(data.errors));
  }

  return data.response || [];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensurePlayer(bucket, id, name, team) {
  if (!bucket[id]) {
    bucket[id] = { playerName: name, team, sums: {}, maxes: {}, ratings: [] };
  }
  return bucket[id];
}

function addSum(entry, key, value) {
  entry.sums[key] = (entry.sums[key] || 0) + value;
}

function trackMax(entry, key, value) {
  entry.maxes[key] = Math.max(entry.maxes[key] || 0, value);
}

async function syncPlayerStats(season) {
  const games = await fetchSeasonGames(season);
  console.log(`${games.length} lejátszott alapszakasz-meccs található a ${season} szezonban.`);

  const passing = {};
  const rushing = {};
  const receiving = {};
  const fumbles = {};
  const tackles = {};
  const fieldGoals = {};
  const kickoffReturns = {};
  const punting = {};

  let processed = 0;
  const failedGames = [];

  for (const g of games) {
    let teamsStats = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        teamsStats = await fetchGameStats(g.game.id);
        break;
      } catch (err) {
        console.warn(`  Hiba a ${g.game.id} meccsnél (${attempt}. próbálkozás): ${err.message}`);
        await sleep(1500 * attempt);
      }
    }

    if (!teamsStats) {
      failedGames.push(g.game.id);
      processed++;
      await sleep(300);
      continue;
    }

    for (const teamBlock of teamsStats) {
      const teamCode = teamCodeFromApiId(teamBlock.team?.id) || teamBlock.team?.name;

      for (const group of teamBlock.groups || []) {
        for (const p of group.players || []) {
          const id = p.player?.id;
          const name = p.player?.name;
          if (!id || !name) continue;
          const s = statMap(p.statistics);

          if (group.name === "Passing") {
            const e = ensurePlayer(passing, id, name, teamCode);
            const [cmp, att] = parseSplit(s["comp att"]);
            addSum(e, "cmp", cmp);
            addSum(e, "att", att);
            addSum(e, "passYds", num(s["yards"]));
            addSum(e, "td", num(s["passing touch downs"]));
            addSum(e, "int", num(s["interceptions"]));
            const [sck, sckY] = parseSplit(s["sacks"]);
            addSum(e, "sck", sck);
            addSum(e, "sckY", sckY);
            if (s["rating"] != null) e.ratings.push(num(s["rating"]));
          }

          if (group.name === "Rushing") {
            const e = ensurePlayer(rushing, id, name, teamCode);
            addSum(e, "att", num(s["total rushes"]));
            addSum(e, "rushYds", num(s["yards"]));
            addSum(e, "td", num(s["rushing touch downs"]));
            trackMax(e, "lng", num(s["longest rush"]));
          }

          if (group.name === "Receiving") {
            const e = ensurePlayer(receiving, id, name, teamCode);
            addSum(e, "tgt", num(s["targets"]));
            addSum(e, "rec", num(s["total receptions"]));
            addSum(e, "yds", num(s["yards"]));
            addSum(e, "td", num(s["receiving touch downs"]));
            trackMax(e, "lng", num(s["longest reception"]));
          }

          if (group.name === "Fumbles") {
            const e = ensurePlayer(fumbles, id, name, teamCode);
            addSum(e, "fum", num(s["total"]));
            addSum(e, "lost", num(s["lost"]));
            addSum(e, "ownRec", num(s["rec"]));
          }

          if (group.name === "Defensive") {
            const e = ensurePlayer(tackles, id, name, teamCode);
            addSum(e, "comb", num(s["tackles"]));
            addSum(e, "solo", num(s["unassisted tackles"]));
            addSum(e, "tfl", num(s["tfl"]));
            addSum(e, "qbHits", num(s["qb hts"]));
            addSum(e, "sacks", num(s["sacks"]));
            addSum(e, "ff", num(s["ff"]));
          }

          if (group.name === "Kick_returns") {
            const e = ensurePlayer(kickoffReturns, id, name, teamCode);
            addSum(e, "ret", num(s["total"]));
            addSum(e, "yds", num(s["yards"]));
            addSum(e, "td", num(s["kick return td"]));
            trackMax(e, "lng", num(s["lg"]));
          }

          if (group.name === "Kicking") {
            const e = ensurePlayer(fieldGoals, id, name, teamCode);
            const [fgm, fga] = parseSplit(s["field goals"]);
            addSum(e, "fgm", fgm);
            addSum(e, "fga", fga);
            const [xpm, xpa] = parseSplit(s["extra point"]);
            addSum(e, "xpm", xpm);
            addSum(e, "xpa", xpa);
            addSum(e, "pts", num(s["points"]));
            trackMax(e, "lng", num(s["long"]));
          }

          if (group.name === "Punting") {
            const e = ensurePlayer(punting, id, name, teamCode);
            addSum(e, "punts", num(s["total"]));
            addSum(e, "yds", num(s["yards"]));
            addSum(e, "tb", num(s["touchbacks"]));
            addSum(e, "in20", num(s["in20"]));
            trackMax(e, "lng", num(s["lg"]));
          }
        }
      }
    }

    processed++;
    if (processed % 20 === 0) console.log(`  ...${processed}/${games.length} meccs feldolgozva`);
    await sleep(300);
  }

  if (failedGames.length) {
    console.warn(`FIGYELEM: ${failedGames.length} meccs sikertelen maradt 3 próbálkozás után: ${failedGames.join(", ")}`);
  }

  console.log("Meccsek feldolgozva, végleges sorok összeállítása...");

  const rows = [];

  for (const [id, e] of Object.entries(passing)) {
    const cmp = e.sums.cmp || 0;
    const att = e.sums.att || 0;
    rows.push({
      apiPlayerId: Number(id),
      playerName: e.playerName,
      team: e.team,
      category: "passing",
      stats: {
        player: e.playerName,
        passYds: e.sums.passYds || 0,
        att,
        cmp,
        cmpPct: att ? Math.round((cmp / att) * 1000) / 10 : 0,
        ydsAtt: att ? Math.round(((e.sums.passYds || 0) / att) * 10) / 10 : 0,
        td: e.sums.td || 0,
        int: e.sums.int || 0,
        rate: e.ratings.length
          ? Math.round((e.ratings.reduce((a, b) => a + b, 0) / e.ratings.length) * 10) / 10
          : 0,
        first: 0, firstPct: 0, "20+": 0, "40+": 0, lng: 0,
        sck: e.sums.sck || 0,
        sckY: e.sums.sckY || 0,
      }
    });
  }

  for (const [id, e] of Object.entries(rushing)) {
    const att = e.sums.att || 0;
    const fum = fumbles[id]?.sums.fum || 0;
    rows.push({
      apiPlayerId: Number(id),
      playerName: e.playerName,
      team: e.team,
      category: "rushing",
      stats: {
        player: e.playerName,
        rushYds: e.sums.rushYds || 0,
        att,
        ydsAtt: att ? Math.round(((e.sums.rushYds || 0) / att) * 10) / 10 : 0,
        td: e.sums.td || 0,
        first: 0, firstPct: 0, "20+": 0, "40+": 0,
        lng: e.maxes.lng || 0,
        fum,
      }
    });
  }

  for (const [id, e] of Object.entries(receiving)) {
    const rec = e.sums.rec || 0;
    const fum = fumbles[id]?.sums.fum || 0;
    rows.push({
      apiPlayerId: Number(id),
      playerName: e.playerName,
      team: e.team,
      category: "receiving",
      stats: {
        player: e.playerName,
        rec,
        tgt: e.sums.tgt || 0,
        yds: e.sums.yds || 0,
        ydsRec: rec ? Math.round(((e.sums.yds || 0) / rec) * 10) / 10 : 0,
        td: e.sums.td || 0,
        first: 0, firstPct: 0, "20+": 0, "40+": 0,
        lng: e.maxes.lng || 0,
        fum,
      }
    });
  }

  for (const [id, e] of Object.entries(fumbles)) {
    rows.push({
      apiPlayerId: Number(id),
      playerName: e.playerName,
      team: e.team,
      category: "fumbles",
      stats: {
        player: e.playerName,
        fum: e.sums.fum || 0,
        lost: e.sums.lost || 0,
        oob: 0,
        forced: 0,
        ownRec: e.sums.ownRec || 0,
        oppRec: 0,
      }
    });
  }

  for (const [id, e] of Object.entries(tackles)) {
    const comb = e.sums.comb || 0;
    const solo = e.sums.solo || 0;
    rows.push({
      apiPlayerId: Number(id),
      playerName: e.playerName,
      team: e.team,
      category: "tackles",
      stats: {
        player: e.playerName,
        comb,
        solo,
        ast: Math.max(0, comb - solo),
        tfl: e.sums.tfl || 0,
        qbHits: e.sums.qbHits || 0,
        sacks: e.sums.sacks || 0,
        ff: e.sums.ff || 0,
        fr: fumbles[id]?.sums.ownRec || 0,
      }
    });
  }

  for (const [id, e] of Object.entries(fieldGoals)) {
    const fgm = e.sums.fgm || 0;
    const fga = e.sums.fga || 0;
    rows.push({
      apiPlayerId: Number(id),
      playerName: e.playerName,
      team: e.team,
      category: "field_goals",
      stats: {
        player: e.playerName,
        fgm,
        fga,
        pct: fga ? Math.round((fgm / fga) * 1000) / 10 : 0,
        lng: e.maxes.lng || 0,
        xpm: e.sums.xpm || 0,
        xpa: e.sums.xpa || 0,
        pts: e.sums.pts || 0,
      }
    });
  }

  for (const [id, e] of Object.entries(kickoffReturns)) {
    const ret = e.sums.ret || 0;
    rows.push({
      apiPlayerId: Number(id),
      playerName: e.playerName,
      team: e.team,
      category: "kickoff_returns",
      stats: {
        player: e.playerName,
        ret,
        yds: e.sums.yds || 0,
        avg: ret ? Math.round(((e.sums.yds || 0) / ret) * 10) / 10 : 0,
        td: e.sums.td || 0,
        lng: e.maxes.lng || 0,
        fc: 0,
        fum: 0,
      }
    });
  }

  for (const [id, e] of Object.entries(punting)) {
    const punts = e.sums.punts || 0;
    rows.push({
      apiPlayerId: Number(id),
      playerName: e.playerName,
      team: e.team,
      category: "punting",
      stats: {
        player: e.playerName,
        punts,
        yds: e.sums.yds || 0,
        avg: punts ? Math.round(((e.sums.yds || 0) / punts) * 10) / 10 : 0,
        net: 0,
        lng: e.maxes.lng || 0,
        in20: e.sums.in20 || 0,
        tb: e.sums.tb || 0,
      }
    });
  }

  console.log(`Írás az adatbázisba: ${rows.length} sor...`);
  let count = 0;
  for (const row of rows) {
    await prisma.playerStat.upsert({
      where: {
        season_category_apiPlayerId: {
          season, category: row.category, apiPlayerId: row.apiPlayerId
        }
      },
      update: { playerName: row.playerName, team: row.team, stats: row.stats },
      create: { season, ...row }
    });
    count++;
    if (count % 100 === 0) console.log(`  ...${count}/${rows.length} sor mentve`);
  }

  console.log(`Kész. ${rows.length} játékos-statisztika sor mentve a ${season} szezonra.`);
}

const season = Number(process.argv[2]) || new Date().getFullYear();
syncPlayerStats(season)
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Hiba:", err);
    prisma.$disconnect();
    process.exit(1);
  });