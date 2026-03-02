import { Router } from "express";
import { PLAYER_STATS_SEED } from "../data/playerStatsSeed.js";

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
  { key: "punt_returns", label: "Punt Returns" }
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
    { key: "sckY", label: "SckY" }
  ]
  // később: rushing/receiving oszlopok
};

function compare(a, b, dir) {
  if (a === b) return 0;
  if (a === undefined || a === null) return 1;
  if (b === undefined || b === null) return -1;
  if (typeof a === "string") return dir === "asc" ? a.localeCompare(b) : b.localeCompare(a);
  return dir === "asc" ? (a > b ? 1 : -1) : (a < b ? 1 : -1);
}

router.get("/player", (req, res) => {
  const season = Number(req.query.season || 2025);
  const category = String(req.query.category || "passing");
  const q = String(req.query.q || "").toLowerCase().trim();

  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(5, Number(req.query.limit || 20)));

  const sortKey = String(req.query.sortKey || "passYds");
  const sortDir = req.query.sortDir === "asc" ? "asc" : "desc";

  const seasonData = PLAYER_STATS_SEED[season] || {};
  const rowsRaw = Array.isArray(seasonData[category]) ? seasonData[category] : [];

  const columns = COLUMNS_BY_CATEGORY[category] || [{ key: "player", label: "Player" }];

  let rows = rowsRaw;

  // search: player name
  if (q) rows = rows.filter(r => String(r.player || "").toLowerCase().includes(q));

  // sort
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
      q
    },
    rows: paged
  });
});

export default router;