import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import TeamLogoMini from "../components/TeamLogoMini";

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/);
  const a = parts[0]?.[0] || "";
  const b = parts[1]?.[0] || "";
  return (a + b).toUpperCase();
}

export default function Stats() {
  const [season, setSeason] = useState(2025);
  const [category, setCategory] = useState("passing");
  const [q, setQ] = useState("");

  const [meta, setMeta] = useState(null);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [sortKey, setSortKey] = useState("passYds");
  const [sortDir, setSortDir] = useState("desc");

  // hover highlight
  const [hoverKey, setHoverKey] = useState(null);

  // fallback category lista (ha backend még nem küldi)
  const categories = meta?.categories || [
    { key: "passing", label: "Passing" },
    { key: "rushing", label: "Rushing" },
    { key: "receiving", label: "Receiving" }
  ];

  const columns = meta?.columns || [{ key: "player", label: "Player" }];

  // a backend küldi a player oszlopot, de mi azt saját UI-val rajzoljuk
  const displayColumns = useMemo(() => {
    return (columns || []).filter((c) => c.key !== "player");
  }, [columns]);

  async function load() {
    setErr("");

    const res = await api.get("/stats/player", {
      params: {
        season,
        category,
        q,
        page,
        limit,
        sortKey,
        sortDir
      }
    });

    setMeta(res.data.meta);
    setRows(res.data.rows);
  }

  // load when filters change
  useEffect(() => {
    load().catch(() => setErr("Nem sikerült betölteni a statisztikákat."));
    // eslint-disable-next-line
  }, [season, category, page, sortKey, sortDir]);

  // search debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load().catch(() => setErr("Nem sikerült betölteni a statisztikákat."));
    }, 350);

    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [q]);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  }

  const totalPages = meta?.totalPages || 1;

  const sortBadge = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    return col ? `${col.label} · ${sortDir.toUpperCase()}` : `${sortKey} · ${sortDir.toUpperCase()}`;
  }, [columns, sortKey, sortDir]);

  const currentPage = meta?.page || page;
  const currentLimit = meta?.limit || limit;

  return (
    <div className="container page">
      {/* HEADER */}
      <div className="hero">
        <div className="kicker">
          <span className="tag">STATS</span>
          <span>Player Stats</span>
        </div>

        <h1 className="h1">Stats</h1>
        <p className="sub">NFL-szerű player statisztika nézet: tabok, év, keresés, rendezés, rangsor.</p>

        {/* FILTER BAR */}
        <div className="filters-bar" style={{ marginTop: 14 }}>
          <div className="filters-group" style={{ flexWrap: "wrap" }}>
            <span className="filters-label">CATEGORY</span>

            {categories.map((c) => (
              <button
                key={c.key}
                className={`btn ${category === c.key ? "primary" : ""}`}
                onClick={() => {
                  setCategory(c.key);
                  setPage(1);
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="filters-group">
            <span className="filters-label">YEAR</span>

            <select
              className="select-dark"
              value={season}
              onChange={(e) => {
                setSeason(Number(e.target.value));
                setPage(1);
              }}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="filters-group">
            <span className="filters-label">SEARCH</span>

            <input
              className="input"
              placeholder="Player name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ height: 42 }}
            />
          </div>

          <div className="filters-spacer" />

          <span className="pill">
            <span className="dot" />
            {sortBadge}
          </span>
        </div>
      </div>

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      {/* TABLE CARD */}
      <div className="card" style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h3 className="card-title" style={{ margin: 0 }}>
            {meta?.season || season} · {categories.find((c) => c.key === category)?.label || category}
          </h3>

          <div className="muted" style={{ fontSize: 13 }}>
            {meta ? `${meta.total} results` : ""}
          </div>
        </div>

        {/* Sticky header needs own scroll container */}
        <div className="table-wrap" style={{ marginTop: 12, maxHeight: 560 }}>
          <table className="table">
            <thead>
              <tr>
                <th className="rank">#</th>

                <th
                  style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  onClick={() => toggleSort("player")}
                  onMouseEnter={() => setHoverKey("player")}
                  onMouseLeave={() => setHoverKey(null)}
                  className={`${sortKey === "player" ? "col-active" : ""} ${hoverKey === "player" ? "col-hover" : ""}`}
                  title="Click to sort"
                >
                  Player
                  {sortKey === "player" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>

                {displayColumns.map((c) => (
                  <th
                    key={c.key}
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                    onClick={() => toggleSort(c.key)}
                    onMouseEnter={() => setHoverKey(c.key)}
                    onMouseLeave={() => setHoverKey(null)}
                    className={`${sortKey === c.key ? "col-active" : ""} ${hoverKey === c.key ? "col-hover" : ""}`}
                    title="Click to sort"
                  >
                    {c.label}
                    {sortKey === c.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, index) => {
                const rank = (currentPage - 1) * currentLimit + index + 1;
                const team = r.team || "—";
                const pos = r.pos || "";

                return (
                  <tr key={`${r.player}-${index}`}>
                    <td className="rank">{rank}</td>

                    <td className={`${sortKey === "player" ? "col-active" : ""} ${hoverKey === "player" ? "col-hover" : ""}`}>
                      <div className="playerCell">
                        <TeamLogoMini
  team={r.team}
  fallbackText={initials(r.player)}
  title={r.team || r.player}
/>

                        <div className="playerMeta">
                          <div className="playerName">{r.player ?? "-"}</div>
                          <div className="playerSub">
                            <span className="teamBadge">{team}</span>
                            {pos ? ` · ${pos}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>

                    {displayColumns.map((c) => (
                      <td
                        key={c.key}
                        className={`${sortKey === c.key ? "col-active" : ""} ${hoverKey === c.key ? "col-hover" : ""}`}
                        style={{ whiteSpace: "nowrap", fontWeight: 600 }}
                      >
                        {r[c.key] ?? "-"}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {!rows.length && (
                <tr>
                  <td colSpan={2 + displayColumns.length} className="muted" style={{ padding: 14 }}>
                    Nincs találat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <div className="muted" style={{ fontSize: 13 }}>
            Page {currentPage} / {totalPages}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" onClick={() => setPage(1)} disabled={currentPage <= 1}>
              First
            </button>

            <button className="btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>
              Prev
            </button>

            <button className="btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
              Next
            </button>

            <button className="btn" onClick={() => setPage(totalPages)} disabled={currentPage >= totalPages}>
              Last
            </button>
          </div>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>
        UI mintázat: NFL.com Player Stats (category tabs + year + sortable table + rank column).
      </p>
    </div>
  );
}