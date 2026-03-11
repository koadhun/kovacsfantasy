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
    try {
      const res = await api.get("/pickem/leaderboard", {
        params: { season: SEASON, week },
      });
      setData(res.data);
    } catch (e) {
      setData(null);
      setErr(e?.response?.data?.error || e?.message || "Nem sikerült betölteni a leaderboardot.");
    }
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
        <p className="sub">
          Tipp-megjelenítés más felhasználónál csak a már elkezdődött meccsekre engedélyezett (anti-cheat).
        </p>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <div className="filters-group">
            <span className="filters-label">WEEK</span>
            <input
              className="input"
              type="number"
              value={week}
              onChange={(e) => setWeek(Number(e.target.value || 1))}
              style={{ width: 140 }}
              min={1}
              max={18}
            />
          </div>

          <div className="filters-spacer" />

          <Link to={`/fantasy/weekly-pickem?week=${week}`} className="btn">
            Back to picks
          </Link>
        </div>
      </div>

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      <div className="grid">
        <div className="col-12 card">
          <h3 className="card-title">Weekly</h3>

          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>User</th>
                <th style={{ width: 120 }}>Points</th>
                <th style={{ width: 160 }}>Correct</th>
              </tr>
            </thead>
            <tbody>
              {weekly.map((r, idx) => (
                <tr key={r.user.id}>
                  <td className="muted">{idx + 1}</td>
                  <td>
                    <Link to={`/fantasy/weekly-pickem/user/${r.user.id}?week=${week}`}>
                      {r.user.username}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 900 }}>{r.points}</td>
                  <td className="muted">
                    {r.correct}/{r.totalGames}
                  </td>
                </tr>
              ))}

              {!weekly.length && (
                <tr>
                  <td colSpan="4" className="muted">
                    Nincs adat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{ height: 14 }} />

          <h3 className="card-title">Season Total</h3>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>User</th>
                <th style={{ width: 160 }}>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {totals.map((r, idx) => (
                <tr key={`${r.userId || r.username}-${idx}`}>
                  <td className="muted">{idx + 1}</td>
                  <td>{r.username}</td>
                  <td style={{ fontWeight: 900 }}>{r.points}</td>
                </tr>
              ))}

              {!totals.length && (
                <tr>
                  <td colSpan="3" className="muted">
                    Nincs adat.
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