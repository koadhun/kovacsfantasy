import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link, useSearchParams } from "react-router-dom";

const SEASON = 2025;

export default function PickEmLeaderboard() {
  const [sp] = useSearchParams();
  const initialWeek = Number(sp.get("week") || 1);

  const [week, setWeek] = useState(initialWeek);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    const res = await api.get("/pickem/leaderboard", { params: { season: SEASON, week } });
    setData(res.data);
  }

  useEffect(() => {
    load().catch(() => setErr("Nem sikerült betölteni a leaderboardot."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);

  const weekly = data?.weekly || [];
  const totals = data?.totals || [];

  const weekTitle = useMemo(() => `Weekly Pick'Em Leaderboard · Week ${week}`, [week]);

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">FANTASY</span>
          <span>Leaderboard</span>
        </div>
        <h1 className="h1">{weekTitle}</h1>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <div className="filters-group">
            <span className="filters-label">WEEK</span>
            <input
              className="input"
              style={{ width: 120, height: 42 }}
              type="number"
              value={week}
              min={1}
              max={18}
              onChange={(e) => setWeek(Number(e.target.value))}
            />
          </div>

          <div className="filters-spacer" />

          <Link to={`/fantasy/weekly-pickem`} className="btn">
            Back to picks
          </Link>
        </div>
      </div>

      {err && <p className="error" style={{ marginTop: 14 }}>{err}</p>}

      <div className="grid" style={{ marginTop: 14 }}>
        <div className="card" style={{ padding: 14 }}>
          <h3 className="card-title" style={{ marginTop: 0 }}>Weekly</h3>

          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Points</th>
                  <th>Correct</th>
                </tr>
              </thead>
              <tbody>
                {weekly.map((r, idx) => (
                  <tr key={r.userId}>
                    <td>{idx + 1}</td>
                    <td>
                      <Link className="muted" to={`/fantasy/weekly-pickem/user/${r.user.id}?week=${week}`}>
                        {r.user.username}
                      </Link>
                    </td>
                    <td style={{ fontWeight: 900 }}>{r.points}</td>
                    <td>{r.correct}/{r.totalGames}</td>
                  </tr>
                ))}
                {!weekly.length && (
                  <tr><td colSpan={4} className="muted" style={{ padding: 12 }}>Nincs adat.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ padding: 14 }}>
          <h3 className="card-title" style={{ marginTop: 0 }}>Season Total</h3>

          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {totals.map((r, idx) => (
                  <tr key={r.userId}>
                    <td>{idx + 1}</td>
                    <td>{r.username}</td>
                    <td style={{ fontWeight: 900 }}>{r.points}</td>
                  </tr>
                ))}
                {!totals.length && (
                  <tr><td colSpan={3} className="muted" style={{ padding: 12 }}>Nincs adat.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>
        Tipp-megjelenítés más felhasználónál csak a már elkezdődött meccsekre engedélyezett (anti-cheat).
      </p>
    </div>
  );
}