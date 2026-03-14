import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link, useSearchParams } from "react-router-dom";
import WeekDropdown from "../components/WeekDropdown";

const SEASON = 2025;

function formatScore(value) {
  return Number(value || 0).toFixed(1);
}

const userLinkStyle = {
  color: "inherit",
  textDecoration: "none",
  fontWeight: 800,
};

export default function PerfectChallengeLeaderboard() {
  const [sp, setSp] = useSearchParams();
  const initialWeek = Number(sp.get("week") || 1);

  const [week, setWeek] = useState(initialWeek);
  const [weeks, setWeeks] = useState([]);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  async function loadWeeks() {
    const res = await api.get("/perfect-challenge/weeks");
    const ws = Array.isArray(res.data?.weeks) ? res.data.weeks : [];

    setWeeks(ws);

    if (!ws.length) return;

    const safeWeek = ws.includes(initialWeek) ? initialWeek : ws[0];
    setWeek(safeWeek);
  }

  async function loadLeaderboard(targetWeek) {
    setErr("");

    try {
      const res = await api.get("/perfect-challenge/leaderboard", {
        params: { season: SEASON, week: targetWeek },
      });

      setData(res.data);
    } catch (e) {
      setData(null);
      setErr(
        e?.response?.data?.error ||
          e?.message ||
          "Nem sikerült betölteni a Perfect Challenge leaderboardot."
      );
    }
  }

  useEffect(() => {
    loadWeeks().catch(() => setErr("Nem sikerült betölteni a heteket."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!week) return;

    const currentQueryWeek = Number(sp.get("week") || 0);
    if (currentQueryWeek !== week) {
      setSp({ week: String(week) }, { replace: true });
    }

    loadLeaderboard(week).catch(() =>
      setErr("Nem sikerült betölteni a Perfect Challenge leaderboardot.")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);

  const weekly = data?.weekly || [];
  const totals = data?.totals || [];

  const weekTitle = useMemo(
    () => `Perfect Challenge Leaderboard · Week ${week}`,
    [week]
  );

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">FANTASY</span>
          <span>Leaderboard</span>
        </div>

        <h1 className="h1">{weekTitle}</h1>

        <p className="sub">
          A heti rangsor az adott hét kiválasztott 8 slotjának összpontja, a
          szezon összesítés pedig az eddigi összes hét Perfect Challenge
          pontjainak összege.
        </p>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <WeekDropdown
            value={week}
            options={weeks}
            onChange={setWeek}
            label="WEEK"
            width={170}
          />

          <div className="filters-spacer" />

          <Link to={`/fantasy/perfect-challenge?week=${week}`} className="btn">
            Back to Perfect Challenge
          </Link>
        </div>
      </div>

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      <div className="card" style={{ marginTop: 14, padding: 16 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Weekly</h3>

        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Points</th>
              <th>Selected</th>
            </tr>
          </thead>

          <tbody>
            {weekly.map((row, idx) => (
              <tr key={row.user.id}>
                <td>{idx + 1}</td>
                <td>
                  <Link
                    to={`/fantasy/perfect-challenge/user/${row.user.id}?week=${week}`}
                    style={userLinkStyle}
                  >
                    {row.user.username}
                  </Link>
                </td>
                <td>{formatScore(row.points)}</td>
                <td>
                  {row.selectedCount}/{row.totalSlots}
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

        <h3 style={{ marginTop: 24, marginBottom: 12 }}>Season Total</h3>

        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Total Points</th>
            </tr>
          </thead>

          <tbody>
            {totals.map((row, idx) => (
              <tr key={row.userId}>
                <td>{idx + 1}</td>
                <td>
                  <Link
                    to={`/fantasy/perfect-challenge/user/${row.userId}?week=${week}`}
                    style={userLinkStyle}
                  >
                    {row.username}
                  </Link>
                </td>
                <td>{formatScore(row.points)}</td>
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
  );
}