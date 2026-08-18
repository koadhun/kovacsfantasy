const API_BASE = "https://v1.american-football.api-sports.io";

function parseSplit(value) {
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

function sumRows(rows, keys) {
  const total = { player: "TEAM" };
  for (const key of keys) {
    total[key] = rows.reduce((sum, r) => sum + num(r[key]), 0);
  }
  return total;
}

function buildPassing(players) {
  const rows = players.map((p) => {
    const s = statMap(p.statistics);
    const [cmp, att] = parseSplit(s["comp att"]);
    const [sck, sckY] = parseSplit(s["sacks"]);
    return {
      player: p.player.name,
      cmp, att,
      cmpPct: att ? Math.round((cmp / att) * 1000) / 10 : 0,
      yds: num(s["yards"]),
      avg: num(s["average"]),
      td: num(s["passing touch downs"]),
      int: num(s["interceptions"]),
      sck, sckY,
      rating: num(s["rating"]),
    };
  });
  const total = sumRows(rows, ["cmp", "att", "yds", "td", "int", "sck", "sckY"]);
  total.cmpPct = total.att ? Math.round((total.cmp / total.att) * 1000) / 10 : 0;
  total.avg = total.att ? Math.round((total.yds / total.att) * 10) / 10 : 0;
  total.rating = rows.length ? Math.round((rows.reduce((s, r) => s + r.rating, 0) / rows.length) * 10) / 10 : 0;
  return { rows, total };
}

function buildRushing(players) {
  const rows = players.map((p) => {
    const s = statMap(p.statistics);
    return {
      player: p.player.name,
      att: num(s["total rushes"]),
      yds: num(s["yards"]),
      td: num(s["rushing touch downs"]),
      avg: num(s["average"]),
      long: num(s["longest rush"]),
    };
  });
  const total = sumRows(rows, ["att", "yds", "td"]);
  total.avg = total.att ? Math.round((total.yds / total.att) * 10) / 10 : 0;
  total.long = rows.length ? Math.max(...rows.map((r) => r.long)) : 0;
  return { rows, total };
}

function buildReceiving(players) {
  const rows = players.map((p) => {
    const s = statMap(p.statistics);
    return {
      player: p.player.name,
      rec: num(s["total receptions"]),
      yds: num(s["yards"]),
      td: num(s["receiving touch downs"]),
      tgts: num(s["targets"]),
      long: num(s["longest reception"]),
      avg: num(s["average"]),
    };
  });
  const total = sumRows(rows, ["rec", "yds", "td", "tgts"]);
  total.avg = total.rec ? Math.round((total.yds / total.rec) * 10) / 10 : 0;
  total.long = rows.length ? Math.max(...rows.map((r) => r.long)) : 0;
  return { rows, total };
}

function buildFumbles(players) {
  const rows = players.map((p) => {
    const s = statMap(p.statistics);
    return {
      player: p.player.name,
      fum: num(s["total"]),
      lost: num(s["lost"]),
      rec: num(s["rec"]),
    };
  });
  const total = sumRows(rows, ["fum", "lost", "rec"]);
  return { rows, total };
}

function buildDefense(players) {
  const rows = players.map((p) => {
    const s = statMap(p.statistics);
    return {
      player: p.player.name,
      tot: num(s["tackles"]),
      solo: num(s["unassisted tackles"]),
      sacks: num(s["sacks"]),
      tfl: num(s["tfl"]),
      pd: num(s["passes defended"]),
      qbHits: num(s["qb hts"]),
      intTd: num(s["interceptions for touch downs"]),
      ff: num(s["ff"]),
    };
  });
  const total = sumRows(rows, ["tot", "solo", "sacks", "tfl", "pd", "qbHits", "intTd", "ff"]);
  return { rows, total };
}

function buildKicking(players) {
  const rows = players.map((p) => {
    const s = statMap(p.statistics);
    const [fgm, fga] = parseSplit(s["field goals"]);
    const [xpm, xpa] = parseSplit(s["extra point"]);
    const fg0to49 =
      num(s["field goals from 1 19 yards"]) +
      num(s["field goals from 20 29 yards"]) +
      num(s["field goals from 30 39 yards"]) +
      num(s["field goals from 40 49 yards"]);
    const fg50plus = num(s["field goals from 50 yards"]);
    return {
      player: p.player.name,
      fgm, fga,
      pct: num(s["pct"]),
      long: num(s["long"]),
      xpm, xpa,
      pts: num(s["points"]),
      fg0to49,
      fg50plus,
    };
  });
  const total = sumRows(rows, ["fgm", "fga", "xpm", "xpa", "pts", "fg0to49", "fg50plus"]);
  total.pct = total.fga ? Math.round((total.fgm / total.fga) * 1000) / 10 : 0;
  total.long = rows.length ? Math.max(...rows.map((r) => r.long)) : 0;
  return { rows, total };
}

function buildPunting(players) {
  const rows = players.map((p) => {
    const s = statMap(p.statistics);
    return {
      player: p.player.name,
      total: num(s["total"]),
      yds: num(s["yards"]),
      avg: num(s["average"]),
      tb: num(s["touchbacks"]),
      in20: num(s["in20"]),
      long: num(s["lg"]),
    };
  });
  const total = sumRows(rows, ["total", "yds", "tb", "in20"]);
  total.avg = total.total ? Math.round((total.yds / total.total) * 10) / 10 : 0;
  total.long = rows.length ? Math.max(...rows.map((r) => r.long)) : 0;
  return { rows, total };
}

function buildKickReturns(players) {
  const rows = players.map((p) => {
    const s = statMap(p.statistics);
    return {
      player: p.player.name,
      total: num(s["total"]),
      yds: num(s["yards"]),
      avg: num(s["average"]),
      long: num(s["lg"]),
      td: num(s["kick return td"]),
    };
  });
  const total = sumRows(rows, ["total", "yds", "td"]);
  total.avg = total.total ? Math.round((total.yds / total.total) * 10) / 10 : 0;
  total.long = rows.length ? Math.max(...rows.map((r) => r.long)) : 0;
  return { rows, total };
}

function buildTeamBoxscore(teamBlock) {
  const groups = {};
  for (const g of teamBlock.groups || []) groups[g.name] = g.players || [];

  return {
    teamName: teamBlock.team?.name || "",
    passing: buildPassing(groups["Passing"] || []),
    rushing: buildRushing(groups["Rushing"] || []),
    receiving: buildReceiving(groups["Receiving"] || []),
    fumbles: buildFumbles(groups["Fumbles"] || []),
    defense: buildDefense(groups["Defensive"] || []),
    kicking: buildKicking(groups["Kicking"] || []),
    punting: buildPunting(groups["Punting"] || []),
    kickReturns: buildKickReturns(groups["Kick_returns"] || []),
  };
}

export async function fetchGameBoxscore(apiGameId) {
  const res = await fetch(
    `${API_BASE}/games/statistics/players?id=${apiGameId}`,
    { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
  );

  if (!res.ok) {
    throw new Error(`API-Football hívás sikertelen: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football hiba: ${JSON.stringify(data.errors)}`);
  }

  const teams = data.response || [];
  if (teams.length < 2) return null;

  return {
    home: buildTeamBoxscore(teams[0]),
    away: buildTeamBoxscore(teams[1]),
  };
}