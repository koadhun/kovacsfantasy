import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import TeamLogo from "../components/TeamLogo";
import SeasonDropdown from "../components/SeasonDropdown";

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

export default function Stats() {
  const [season, setSeason] = useState(2025);
  const [category, setCategory] = useState("passing");
  const [q, setQ] = useState("");
  const [meta, setMeta] = useState(null);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortKey, setSortKey] = useState("passYds");
  const [sortDir, setSortDir] = useState("desc");
  const [hoverKey, setHoverKey] = useState(null);

  const categories = meta?.categories || [
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

  const columns = meta?.columns || [{ key: "player", label: "Player" }];
  const searchMode = !!meta?.searchMode;

  const displayColumns = useMemo(() => {
    return (columns || []).filter((c) => c.key !== "player");
  }, [columns]);

  async function load() {
    setErr("");
    const res = await api.get("/stats/player", {
      params: { season, category, q, page, limit, sortKey, sortDir },
    });
    setMeta(res.data.meta);
    setRows(res.data.rows);
  }

  useEffect(() => {
    load().catch(() => setErr("Nem sikerült betölteni a statisztikákat."));
    // eslint-disable-next-line
  }, [season, category, page, sortKey, sortDir]);

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
      setSortDir(key === "player" ? "asc" : "desc");
    }
    setPage(1);
  }

  const totalPages = meta?.totalPages || 1;

  const sortBadge = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    return col
      ? `${col.label} · ${sortDir.toUpperCase()}`
      : `${sortKey} · ${sortDir.toUpperCase()}`;
  }, [columns, sortKey, sortDir]);

  const currentPage = meta?.page || page;
  const currentLimit = meta?.limit || limit;

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">STATS</span>
          <span>Player Stats</span>
        </div>

        <h1 className="h1">Stats</h1>

        <p className="sub">
          NFL-szerű player statisztika nézet: tabok, év, keresés, rendezés, rangsor.
        </p>

        <div className="filters-bar">
          <div className="filters-group">
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

          <SeasonDropdown
            value={season}
            options={YEARS}
            onChange={(year) => {
              setSeason(Number(year));
              setPage(1);
            }}
            label="SEASON"
            width={170}
          />

          <div className="filters-group" style={{ minWidth: 310 }}>
            <span className="filters-label">SEARCH</span>
            <input
              className="input-dark"
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

      <div className="card" style={{ marginTop: 14 }}>
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h3 style={{ margin: 0 }}>
            {meta?.season || season} ·{" "}
            {searchMode
              ? `Search results${q ? ` for "${q}"` : ""}`
              : categories.find((c) => c.key === category)?.label || category}
          </h3>
          <div className="muted">{meta ? `${meta.total} results` : ""}</div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th
                  onClick={() => toggleSort("player")}
                  onMouseEnter={() => setHoverKey("player")}
                  onMouseLeave={() => setHoverKey(null)}
                  className={`${sortKey === "player" ? "col-active" : ""} ${
                    hoverKey === "player" ? "col-hover" : ""
                  }`}
                  title="Click to sort"
                  style={{ cursor: "pointer" }}
                >
                  Player {sortKey === "player" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>

                {displayColumns.map((c) => (
                  <th
                    key={c.key}
                    onClick={() => toggleSort(c.key)}
                    onMouseEnter={() => setHoverKey(c.key)}
                    onMouseLeave={() => setHoverKey(null)}
                    className={`${sortKey === c.key ? "col-active" : ""} ${
                      hoverKey === c.key ? "col-hover" : ""
                    }`}
                    title="Click to sort"
                    style={{ cursor: "pointer" }}
                  >
                    {c.label} {sortKey === c.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
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
                  <tr key={`${r.player}-${r.statCategory || category}-${index}`}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          minWidth: 260,
                        }}
                      >
                        <div
                          style={{
                            minWidth: 28,
                            textAlign: "right",
                            fontWeight: 900,
                            color: "rgba(255,255,255,.65)",
                          }}
                        >
                          {rank}
                        </div>

                        <TeamLogo team={team} size={26} />

                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800 }}>{r.player ?? "-"}</div>
                          <div
                            className="muted"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 12,
                            }}
                          >
                            <span>
                              {team}
                              {pos ? ` · ${pos}` : ""}
                              {r.statCategoryLabel ? ` · ${r.statCategoryLabel}` : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {displayColumns.map((c) => (
                      <td key={c.key}>{r[c.key] ?? "-"}</td>
                    ))}
                  </tr>
                );
              })}

              {!rows.length && (
                <tr>
                  <td colSpan={displayColumns.length + 1} className="muted">
                    Nincs találat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="filters-bar"
        style={{ marginTop: 14, justifyContent: "space-between" }}
      >
        <div className="muted">
          Page {currentPage} / {totalPages}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className="btn"
            onClick={() => setPage(1)}
            disabled={currentPage <= 1}
          >
            First
          </button>
          <button
            className="btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            Prev
          </button>
          <button
            className="btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
          <button
            className="btn"
            onClick={() => setPage(totalPages)}
            disabled={currentPage >= totalPages}
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}