import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useLanguage } from "../i18n/LanguageContext";

const GAMES = [
  { value: "WEEKLY_PICKEM", label: "Weekly Pick'Em" },
  { value: "PERFECT_CHALLENGE", label: "Perfect Challenge" },
  { value: "PLAYOFF_CHALLENGE", label: "Playoff Challenge" },
];

export default function AdminHallOfFame() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const [season, setSeason] = useState(new Date().getFullYear());
  const [game, setGame] = useState("WEEKLY_PICKEM");
  const [rank, setRank] = useState(1);
  const [username, setUsername] = useState("");
  const [points, setPoints] = useState("");

  async function load() {
    setErr("");
    const res = await api.get("/hall-of-fame");
    setEntries(res.data.entries || []);
  }

  useEffect(() => {
    load().catch(() => setErr(t("adminHallOfFame.loadError")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!username.trim()) {
      setErr(t("adminHallOfFame.usernameRequired"));
      return;
    }

    try {
      await api.post("/hall-of-fame", {
        season: Number(season),
        game,
        rank: Number(rank),
        username: username.trim(),
        points: Number(points) || 0,
      });
      setMsg(t("adminHallOfFame.saved"));
      setUsername("");
      setPoints("");
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.error || t("adminHallOfFame.saveError"));
    }
  }

  async function remove(id) {
    setErr("");
    setMsg("");
    const ok = window.confirm(t("adminHallOfFame.confirmDelete"));
    if (!ok) return;

    try {
      await api.delete(`/hall-of-fame/${id}`);
      setMsg(t("adminHallOfFame.deleted"));
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.error || t("adminHallOfFame.deleteError"));
    }
  }

  const gameLabel = (value) => GAMES.find((g) => g.value === value)?.label || value;

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => b.season - a.season || a.game.localeCompare(b.game) || a.rank - b.rank
      ),
    [entries]
  );

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>{t("adminHallOfFame.title")}</h1>
          <p>{t("adminHallOfFame.subtitle")}</p>
        </div>
      </div>

      {err && <p className="error">{err}</p>}
      {msg && <p className="success">{msg}</p>}

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>{t("adminHallOfFame.addTitle")}</h3>

        <form
          onSubmit={submit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div>
            <label className="muted" style={{ fontSize: 12, fontWeight: 800, display: "block", marginBottom: 6 }}>
              {t("adminHallOfFame.seasonLabel")}
            </label>
            <input
              className="input-dark"
              type="number"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              style={{ width: "100%", height: 42 }}
            />
          </div>

          <div>
            <label className="muted" style={{ fontSize: 12, fontWeight: 800, display: "block", marginBottom: 6 }}>
              {t("adminHallOfFame.gameLabel")}
            </label>
            <select
              className="select-dark"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              style={{ width: "100%", height: 42 }}
            >
              {GAMES.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="muted" style={{ fontSize: 12, fontWeight: 800, display: "block", marginBottom: 6 }}>
              {t("adminHallOfFame.rankLabel")}
            </label>
            <select
              className="select-dark"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              style={{ width: "100%", height: 42 }}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>

          <div>
            <label className="muted" style={{ fontSize: 12, fontWeight: 800, display: "block", marginBottom: 6 }}>
              {t("adminHallOfFame.usernameLabel")}
            </label>
            <input
              className="input-dark"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%", height: 42 }}
            />
          </div>

          <div>
            <label className="muted" style={{ fontSize: 12, fontWeight: 800, display: "block", marginBottom: 6 }}>
              {t("adminHallOfFame.pointsLabel")}
            </label>
            <input
              className="input-dark"
              type="number"
              step="0.1"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              style={{ width: "100%", height: 42 }}
            />
          </div>

          <button className="btn primary" type="submit" style={{ height: 42 }}>
            {t("adminHallOfFame.save")}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 10, fontSize: 12 }}>
          {t("adminHallOfFame.upsertHint")}
        </p>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>{t("adminHallOfFame.colSeason")}</th>
              <th>{t("adminHallOfFame.colGame")}</th>
              <th>{t("adminHallOfFame.colRank")}</th>
              <th>{t("adminHallOfFame.colUsername")}</th>
              <th>{t("adminHallOfFame.colPoints")}</th>
              <th>{t("adminHallOfFame.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((e) => (
              <tr key={e.id}>
                <td>{e.season}</td>
                <td>{gameLabel(e.game)}</td>
                <td>{e.rank}</td>
                <td>{e.username}</td>
                <td>{Number(e.points).toFixed(1)}</td>
                <td>
                  <button className="btn danger" onClick={() => remove(e.id)}>
                    {t("adminHallOfFame.delete")}
                  </button>
                </td>
              </tr>
            ))}

            {!sortedEntries.length && (
              <tr>
                <td colSpan="6" className="muted">
                  {t("adminHallOfFame.noEntries")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}