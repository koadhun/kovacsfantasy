import { Router } from "express";
import { PLAYER_STATS_SEED } from "../data/PlayerStatsSeed.js";

const router = Router();

const CATEGORIES = [
  { key: "passing", label: "Passing" },
  { key: "rushing", label: "Rushing" },
  { key: "receiving", label: "Receiving" },
  { key: "fumbles", label: "Fumbles" },
  { key: "tackles", label: "Tackles" },
  { key: "interceptions", label: "Interceptions" },
  { key: "field_goals", label: "Field Goals" },
  { key: "kickoffs", label: "Kickoffs" },
  { key: "kickoff_returns", label: "Kickoff Returns" },
  { key: "punting", label: "Punting" },
  { key: "punt_returns", label: "Punt Returns" },
];

const COLUMNS_BY_CATEGORY = {
  passing: [
    { key: "player", label: "Player" },
    { key: "passYds", label: "Pass Yds" },
    { key: "ydsAtt", label: "Yds/Att" },
    { key: "att", label: "Att" },
    { key: "cmp", label: "Cmp" },
    { key: "cmpPct", label: "Cmp %" },
    { key: "td", label: "TD" },
    { key: "int", label: "INT" },
    { key: "rate", label: "Rate" },
    { key: "first", label: "1st" },
    { key: "firstPct", label: "1st%" },
    { key: "20+", label: "20+" },
    { key: "40+", label: "40+" },
    { key: "lng", label: "Lng" },
    { key: "sck", label: "Sck" },
    { key: "sckY", label: "SckY" },
  ],

  rushing: [
    { key: "player", label: "Player" },
    { key: "rushYds", label: "Rush Yds" },
    { key: "att", label: "Att" },
    { key: "ydsAtt", label: "Yds/Att" },
    { key: "td", label: "TD" },
    { key: "first", label: "1st" },
    { key: "firstPct", label: "1st%" },
    { key: "20+", label: "20+" },
    { key: "40+", label: "40+" },
    { key: "lng", label: "Lng" },
    { key: "fum", label: "Fum" },
  ],

  receiving: [
    { key: "player", label: "Player" },
    { key: "rec", label: "Rec" },
    { key: "tgt", label: "Tgt" },
    { key: "yds", label: "Yds" },
    { key: "ydsRec", label: "Yds/Rec" },
    { key: "td", label: "TD" },
    { key: "first", label: "1st" },
    { key: "firstPct", label: "1st%" },
    { key: "20+", label: "20+" },
    { key: "40+", label: "40+" },
    { key: "lng", label: "Lng" },
    { key: "fum", label: "Fum" },
  ],

  fumbles: [
    { key: "player", label: "Player" },
    { key: "fum", label: "Fum" },
    { key: "lost", label: "Lost" },
    { key: "oob", label: "OOB" },
    { key: "forced", label: "Forced" },
    { key: "ownRec", label: "Own Rec" },
    { key: "oppRec", label: "Opp Rec" },
  ],

  tackles: [
    { key: "player", label: "Player" },
    { key: "comb", label: "Comb" },
    { key: "solo", label: "Solo" },
    { key: "ast", label: "Ast" },
    { key: "tfl", label: "TFL" },
    { key: "qbHits", label: "QB Hits" },
    { key: "sacks", label: "Sacks" },
    { key: "ff", label: "FF" },
    { key: "fr", label: "FR" },
  ],

  interceptions: [
    { key: "player", label: "Player" },
    { key: "int", label: "INT" },
    { key: "yds", label: "Yds" },
    { key: "td", label: "TD" },
    { key: "lng", label: "Lng" },
    { key: "pd", label: "PD" },
  ],

  field_goals: [
    { key: "player", label: "Player" },
    { key: "fgm", label: "FGM" },
    { key: "fga", label: "FGA" },
    { key: "pct", label: "FG %" },
    { key: "lng", label: "Lng" },
    { key: "xpm", label: "XPM" },
    { key: "xpa", label: "XPA" },
    { key: "pts", label: "Pts" },
  ],

  kickoffs: [
    { key: "player", label: "Player" },
    { key: "ko", label: "KO" },
    { key: "yds", label: "Yds" },
    { key: "tb", label: "TB" },
    { key: "tbPct", label: "TB %" },
    { key: "ret", label: "Ret" },
    { key: "retYds", label: "Ret Yds" },
  ],

  kickoff_returns: [
    { key: "player", label: "Player" },
    { key: "ret", label: "Ret" },
    { key: "yds", label: "Yds" },
    { key: "avg", label: "Avg" },
    { key: "td", label: "TD" },
    { key: "lng", label: "Lng" },
    { key: "fc", label: "FC" },
    { key: "fum", label: "Fum" },
  ],

  punting: [
    { key: "player", label: "Player" },
    { key: "punts", label: "Punts" },
    { key: "yds", label: "Yds" },
    { key: "avg", label: "Avg" },
    { key: "net", label: "Net" },
    { key: "lng", label: "Lng" },
    { key: "in20", label: "In20" },
    { key: "tb", label: "TB" },
  ],

  punt_returns: [
    { key: "player", label: "Player" },
    { key: "ret", label: "Ret" },
    { key: "yds", label: "Yds" },
    { key: "avg", label: "Avg" },
    { key: "td", label: "TD" },
    { key: "lng", label: "Lng" },
    { key: "fc", label: "FC" },
    { key: "fum", label: "Fum" },
  ],
};

function compare(a, b, dir) {
  if (a === b) return 0;
  if (a === undefined || a === null) return 1;
  if (b === undefined || b === null) return -1;

  if (typeof a === "string" || typeof b === "string") {
    const aa = String(a ?? "");
    const bb = String(b ?? "");
    return dir === "asc" ? aa.localeCompare(bb) : bb.localeCompare(aa);
  }

  return dir === "asc" ? (a > b ? 1 : -1) : (a < b ? 1 : -1);
}

function defaultSortKeyForCategory(category) {
  switch (category) {
    case "passing":
      return "passYds";
    case "rushing":
      return "rushYds";
    case "receiving":
      return "yds";
    case "fumbles":
      return "fum";
    case "tackles":
      return "comb";
    case "interceptions":
      return "int";
    case "field_goals":
      return "fgm";
    case "kickoffs":
      return "ko";
    case "kickoff_returns":
      return "yds";
    case "punting":
      return "avg";
    case "punt_returns":
      return "yds";
    default:
      return "player";
  }
}

router.get("/player", (req, res) => {
  const season = Number(req.query.season || 2025);
  const category = String(req.query.category || "passing");
  const q = String(req.query.q || "").toLowerCase().trim();
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(5, Number(req.query.limit || 10)));
  const sortKey = String(req.query.sortKey || defaultSortKeyForCategory(category));
  const sortDir = req.query.sortDir === "asc" ? "asc" : "desc";

  const seasonData = PLAYER_STATS_SEED[season] || {};
  const rowsRaw = Array.isArray(seasonData[category]) ? seasonData[category] : [];
  const columns = COLUMNS_BY_CATEGORY[category] || [{ key: "player", label: "Player" }];

  let rows = rowsRaw;

  if (q) {
    rows = rows.filter((r) =>
      String(r.player || "").toLowerCase().includes(q)
    );
  }

  rows = [...rows].sort((ra, rb) => compare(ra[sortKey], rb[sortKey], sortDir));

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const paged = rows.slice(start, start + limit);

  return res.json({
    meta: {
      season,
      category,
      categories: CATEGORIES,
      columns,
      total,
      page: safePage,
      totalPages,
      limit,
      sortKey,
      sortDir,
      q,
    },
    rows: paged,
  });
});

export default router;