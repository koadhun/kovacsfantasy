import { useEffect, useState } from "react";
import { api } from "../api";
import { Link, useParams, useSearchParams } from "react-router-dom";

const SEASON = 2025;

export default function PickEmUserPicks() {
  const { userId } = useParams();
  const [sp] = useSearchParams();
  const week = Number(sp.get("week") || 1);

  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    const res = await api.get(`/pickem/user/${userId}/picks`, { params: { season: SEASON, week } });
    setRows(res.data.picks || []);
  }

  useEffect(() => {
    load().catch(() => setErr("Nem sikerült betölteni a tippeket."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, week]);

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">FANTASY</span>
          <span>User Picks</span>
        </div>
        <h1 className="h1">User Picks · Week {week}</h1>
        <p className="sub">Csak a már elkezdődött meccsek tippjei láthatók.</p>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <div className="filters-spacer" />
          <Link className="btn" to={`/fantasy/weekly-pickem/leaderboard?week=${week}`}>Back to leaderboard</Link>
        </div>
      </div>

      {err && <p className="error" style={{ marginTop: 14 }}>{err}</p>}

      <div className="card" style={{ marginTop: 14, padding: 14 }}>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Kickoff</th>
                <th>Match</th>
                <th>Picked</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.gameId}>
                  <td className="muted" style={{ whiteSpace: "nowrap" }}>
                    {new Date(r.kickoffAt).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 900 }}>{r.awayTeam} @ {r.homeTeam}</td>
                  <td style={{ fontWeight: 900 }}>{r.picked ?? "—"}</td>
                  <td className="muted">
                    {r.status === "FINAL"
                      ? `${r.awayScore} - ${r.homeScore}`
                      : "IN PROGRESS / STARTED"
                    }
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={4} className="muted" style={{ padding: 12 }}>Nincs megjeleníthető tipp.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}