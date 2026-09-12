import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useLanguage } from "../i18n/LanguageContext";

const GAMES = [
  { value: "WEEKLY_PICKEM", label: "Weekly Pick'Em" },
  { value: "PERFECT_CHALLENGE", label: "Perfect Challenge" },
  { value: "PLAYOFF_CHALLENGE", label: "Playoff Challenge" },
];

const EMPTY_FORM = {
  season: new Date().getFullYear(),
  game: "WEEKLY_PICKEM",
  rank: 1,
  username: "",
  points: "",
};

export default function AdminHallOfFame() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const isEditing = editingId !== null;

  async function load() {
    setErr("");
    const res = await api.get("/hall-of-fame");
    setEntries(res.data.entries || []);
  }

  useEffect(() => {
    load().catch(() => setErr(t("adminHallOfFame.loadError")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(entry) {
    setEditingId(entry.id);
    setForm({
      season: entry.season,
      game: entry.game,
      rank: entry.rank,
      username: entry.username,
      points: entry.points,
    });
    setErr("");
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErr("");
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!form.username.trim()) {
      setErr(t("adminHallOfFame.usernameRequired"));
      return;
    }

    const payload = {
      season: Number(form.season),
      game: form.game,
      rank: Number(form.rank),
      username: form.username.trim(),
      points: Number(form.points) || 0,
    };

    try {
      if (isEditing) {
        await api.put(`/hall-of-fame/${editingId}`, payload);
        setMsg(t("adminHallOfFame.saved"));
        setEditingId(null);
      } else {
        await api.post("/hall-of-fame", payload);
        setMsg(t("adminHallOfFame.saved"));
      }

      setForm(EMPTY_FORM);
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
      if (editingId === id) cancelEdit();
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.error || t("adminHallOfFame.deleteError"));
    }
  }

  const gameLabel = (value) => GAMES.find((g) => g.value === value)?.label || value;

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) =>
          b.season - a.season ||
          a.game.localeCompare(b.game) ||
          a.rank - b.rank ||
          b.points - a.points
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
        <h3 style={{ marginTop: 0 }}>
          {isEditing ? t("adminHallOfFame.editTitle") : t("adminHallOfFame.addTitle")}
        </h3>

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
              value={form.season}
              onChange={(e) => setField("season", e.target.value)}
              style={{ width: "100%", height: 42 }}
            />
          </div>

          <div>
            <label className="muted" style={{ fontSize: 12, fontWeight: 800, display: "block", marginBottom: 6 }}>
              {t("adminHallOfFame.gameLabel")}
            </label>
            <select
              className="select-dark"
              value={form.game}
              onChange={(e) => setField("game", e.target.value)}
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
              value={form.rank}
              onChange={(e) => setField("rank", e.target.value)}
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
              value={form.username}
              onChange={(e) => setField("username", e.target.value)}
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
              value={form.points}
              onChange={(e) => setField("points", e.target.value)}
              style={{ width: "100%", height: 42 }}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn primary" type="submit" style={{ height: 42, flex: 1 }}>
              {isEditing ? t("adminHallOfFame.update") : t("adminHallOfFame.save")}
            </button>

            {isEditing && (
              <button
                type="button"
                className="btn"
                style={{ height: 42 }}
                onClick={cancelEdit}
              >
                {t("adminHallOfFame.cancel")}
              </button>
            )}
          </div>
        </form>

        <p className="muted" style={{ marginTop: 10, fontSize: 12 }}>
          {isEditing ? t("adminHallOfFame.editHint") : t("adminHallOfFame.tiesHint")}
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
              <tr
                key={e.id}
                style={
                  editingId === e.id
                    ? { background: "rgba(59,130,246,.10)" }
                    : undefined
                }
              >
                <td>{e.season}</td>
                <td>{gameLabel(e.game)}</td>
                <td>{e.rank}</td>
                <td>{e.username}</td>
                <td>{Number(e.points).toFixed(1)}</td>
                <td>
                  <div className="actions">
                    <button className="btn" onClick={() => startEdit(e)}>
                      {t("adminHallOfFame.edit")}
                    </button>
                    <button className="btn danger" onClick={() => remove(e.id)}>
                      {t("adminHallOfFame.delete")}
                    </button>
                  </div>
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