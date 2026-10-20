import { useEffect, useRef, useState } from "react";
import { api } from "../../api";
import { useLanguage } from "../../i18n/LanguageContext";

const GAME_LABELS = {
  PICKEM: "Weekly Pick'Em",
  PERFECT: "Perfect Challenge",
  PLAYOFF: "Playoff Challenge",
};

const ROUND_LABELS = {
  WILDCARD: "Wildcard Weekend",
  DIVISIONAL: "Divisional Playoffs",
  CONFERENCE: "Conference Championships",
  SUPER_BOWL: "Super Bowl",
};

const PAGE_SIZE = 50;

function formatTime(value, language) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleString(language === "hu" ? "hu-HU" : "en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 800,
  display: "block",
  marginBottom: 6,
};

export default function AdminChangeLog() {
  const { t, language } = useLanguage();

  const [game, setGame] = useState("");
  const [season, setSeason] = useState("");
  const [week, setWeek] = useState("");
  const [round, setRound] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [reloadTick, setReloadTick] = useState(0);

  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const requestId = useRef(0);

  // A felhasználónév-keresés kis késleltetéssel fusson, ne minden betűnél.
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const current = ++requestId.current;

    async function load() {
      setErr("");
      setLoading(true);

      const params = { page, limit: PAGE_SIZE };
      if (game) params.game = game;
      if (season) params.season = season;
      if (week !== "") params.week = week;
      if (round) params.round = round;
      if (debouncedQuery) params.q = debouncedQuery;

      try {
        const res = await api.get("/admin/change-log", { params });
        // Elavult (közben lecserélt szűrőhöz tartozó) válasz eldobása
        if (current !== requestId.current) return;

        setEntries(res.data.entries || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        setSeasons(res.data.seasons || []);
      } catch (e) {
        if (current !== requestId.current) return;
        setErr(e?.response?.data?.error || t("adminChangeLog.loadError"));
      } finally {
        if (current === requestId.current) setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, season, week, round, debouncedQuery, page, reloadTick]);

  function changeGame(value) {
    setGame(value);
    setWeek("");
    setRound("");
    setPage(1);
  }

  function resetFilters() {
    setGame("");
    setSeason("");
    setWeek("");
    setRound("");
    setQuery("");
    setDebouncedQuery("");
    setPage(1);
  }

  function periodLabel(entry) {
    if (entry.round) return ROUND_LABELS[entry.round] || entry.round;
    if (entry.week != null) return `${t("adminChangeLog.weekShort")} ${entry.week}`;
    return "-";
  }

  const showWeek = game === "PICKEM" || game === "PERFECT";
  const showRound = game === "PLAYOFF";

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>{t("adminChangeLog.title")}</h1>
          <p>{t("adminChangeLog.subtitle")}</p>
        </div>
      </div>

      {err && <p className="error">{err}</p>}

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div>
            <label className="muted" style={labelStyle}>
              {t("adminChangeLog.gameLabel")}
            </label>
            <select
              className="select-dark"
              value={game}
              onChange={(e) => changeGame(e.target.value)}
              style={{ width: "100%", height: 42 }}
            >
              <option value="">{t("adminChangeLog.allGames")}</option>
              {Object.entries(GAME_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="muted" style={labelStyle}>
              {t("adminChangeLog.seasonLabel")}
            </label>
            <select
              className="select-dark"
              value={season}
              onChange={(e) => {
                setSeason(e.target.value);
                setPage(1);
              }}
              style={{ width: "100%", height: 42 }}
            >
              <option value="">{t("adminChangeLog.allSeasons")}</option>
              {seasons.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {showWeek && (
            <div>
              <label className="muted" style={labelStyle}>
                {t("adminChangeLog.weekLabel")}
              </label>
              <input
                className="input-dark"
                type="number"
                min="0"
                max="30"
                placeholder={t("adminChangeLog.anyWeek")}
                value={week}
                onChange={(e) => {
                  setWeek(e.target.value);
                  setPage(1);
                }}
                style={{ width: "100%", height: 42 }}
              />
            </div>
          )}

          {showRound && (
            <div>
              <label className="muted" style={labelStyle}>
                {t("adminChangeLog.roundLabel")}
              </label>
              <select
                className="select-dark"
                value={round}
                onChange={(e) => {
                  setRound(e.target.value);
                  setPage(1);
                }}
                style={{ width: "100%", height: 42 }}
              >
                <option value="">{t("adminChangeLog.allRounds")}</option>
                {Object.entries(ROUND_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="muted" style={labelStyle}>
              {t("adminChangeLog.userLabel")}
            </label>
            <input
              className="input-dark"
              placeholder={t("adminChangeLog.userPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: "100%", height: 42 }}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn"
              style={{ height: 42, flex: 1 }}
              onClick={resetFilters}
            >
              {t("adminChangeLog.reset")}
            </button>
            <button
              type="button"
              className="btn primary"
              style={{ height: 42, flex: 1 }}
              onClick={() => setReloadTick((n) => n + 1)}
            >
              {t("adminChangeLog.refresh")}
            </button>
          </div>
        </div>

        <p className="muted" style={{ marginTop: 10, marginBottom: 0, fontSize: 12 }}>
          {t("adminChangeLog.hint")}
        </p>
      </div>

      <div className="card">
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div className="muted">
            {loading
              ? t("adminChangeLog.loading")
              : `${total} ${t("adminChangeLog.resultsSuffix")}`}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              className="btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t("adminChangeLog.prev")}
            </button>
            <span className="muted">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              {t("adminChangeLog.next")}
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>{t("adminChangeLog.colWhen")}</th>
                <th>{t("adminChangeLog.colUser")}</th>
                <th>{t("adminChangeLog.colGame")}</th>
                <th>{t("adminChangeLog.colPeriod")}</th>
                <th>{t("adminChangeLog.colTarget")}</th>
                <th>{t("adminChangeLog.colFrom")}</th>
                <th>{t("adminChangeLog.colTo")}</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {formatTime(e.createdAt, language)}
                  </td>
                  <td style={{ fontWeight: 800 }}>{e.username}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {GAME_LABELS[e.game] || e.game}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {e.season} · {periodLabel(e)}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{e.target}</td>
                  <td className="muted">{e.previousValue ?? "—"}</td>
                  <td style={{ fontWeight: 800 }}>{e.newValue}</td>
                </tr>
              ))}

              {!entries.length && !loading && (
                <tr>
                  <td colSpan="7" className="muted">
                    {t("adminChangeLog.noEntries")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
