import { useEffect, useState } from "react";
import { api } from "../../api";

const SEASON = 2025;

export default function ScheduleResultsEditor() {
  const [week, setWeek] = useState(1);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function loadGames() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await api.get("/admin/schedule", {
        params: { season: SEASON, week }
      });
      setGames(res.data.games || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Nem sikerült betölteni a meccseket.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);

  function updateGame(id, field, value) {
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  }

  async function save() {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      await api.post("/admin/schedule", { games });
      setMsg("Results saved successfully ✅");
      await loadGames();
    } catch (e) {
      setErr(e?.response?.data?.error || "Mentés sikertelen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">ADMIN</span>
          <span>Schedule</span>
        </div>

        <h1 className="h1">Schedule Results Editor</h1>
        <p className="sub">Eredmények és státusz szerkesztése (SCHEDULED / FINAL).</p>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <div className="filters-group">
            <span className="filters-label">WEEK</span>

            <select
              value={week}
              onChange={(e) => setWeek(Number(e.target.value))}
              className="select-dark"
              disabled={loading}
            >
              {Array.from({ length: 18 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Week {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="filters-spacer" />

          <button className="btn primary" onClick={save} disabled={loading}>
            {loading ? "Saving..." : "Save Results"}
          </button>
        </div>
      </div>

      {msg && <div className="success" style={{ marginTop: 14 }}>{msg}</div>}
      {err && <div className="error" style={{ marginTop: 14 }}>{err}</div>}

      <div className="card" style={{ marginTop: 14, padding: 14 }}>
        <div style={{ overflowX: "auto" }}>
          <table className="adminTable">
            <thead>
              <tr>
                <th>Away</th>
                <th></th>
                <th>Home</th>
                <th>Away Score</th>
                <th>Home Score</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {games.map((g) => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 900 }}>{g.awayTeam}</td>
                  <td className="muted">@</td>
                  <td style={{ fontWeight: 900 }}>{g.homeTeam}</td>

                  <td>
                    <input
                      type="number"
                      value={g.awayScore ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateGame(g.id, "awayScore", v === "" ? null : Number(v));
                      }}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={g.homeScore ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateGame(g.id, "homeScore", v === "" ? null : Number(v));
                      }}
                    />
                  </td>

                  <td>
                    <select
                      value={g.status}
                      onChange={(e) => updateGame(g.id, "status", e.target.value)}
                    >
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="FINAL">FINAL</option>
                    </select>
                  </td>
                </tr>
              ))}

              {!games.length && (
                <tr>
                  <td colSpan={6} className="muted" style={{ padding: 12 }}>
                    Nincs meccs ehhez a héthez.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}