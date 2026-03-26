import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";

const SEASON = 2025;

const userLinkStyle = {
  color: "inherit",
  textDecoration: "none",
  fontWeight: 800,
};

function formatScore(value) {
  return Number(value || 0).toFixed(1);
}

function RoundDropdown({ value, options, onChange }) {
  return (
    <label
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <span
        className="muted"
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: ".08em",
          textTransform: "uppercase",
        }}
      >
        Round
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          minWidth: 240,
          height: 44,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(9,18,42,.94)",
          color: "#fff",
          padding: "0 14px",
          fontSize: 14,
          fontWeight: 700,
          outline: "none",
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function PlayoffChallengeLeaderboard() {
  const [sp, setSp] = useSearchParams();
  const initialRound = String(sp.get("round") || "WILDCARD");

  const [round, setRound] = useState(initialRound);
  const [rounds, setRounds] = useState([]);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  async function loadRounds() {
    const res = await api.get("/playoff-challenge/rounds");
    const items = Array.isArray(res.data?.rounds) ? res.data.rounds : [];

    setRounds(items);

    if (!items.length) return;

    const safeRound = items.some((item) => item.value === initialRound)
      ? initialRound
      : items[0].value;

    setRound(safeRound);
  }

  async function loadLeaderboard(targetRound) {
    setErr("");

    try {
      const res = await api.get("/playoff-challenge/leaderboard", {
        params: { season: SEASON, round: targetRound },
      });
      setData(res.data);
    } catch (e) {
      setData(null);
      setErr(
        e?.response?.data?.error ||
          e?.message ||
          "Nem sikerült betölteni a Playoff Challenge leaderboardot."
      );
    }
  }

  useEffect(() => {
    loadRounds().catch(() =>
      setErr("Nem sikerült betölteni a playoff köröket.")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!round) return;

    const currentQueryRound = String(sp.get("round") || "");
    if (currentQueryRound !== round) {
      setSp({ round }, { replace: true });
    }

    loadLeaderboard(round).catch(() =>
      setErr("Nem sikerült betölteni a Playoff Challenge leaderboardot.")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const roundRows = data?.roundRows || [];
  const totals = data?.totals || [];
  const roundLabel = data?.roundLabel || round;

  const title = useMemo(
    () => `Playoff Challenge Leaderboard · ${roundLabel}`,
    [roundLabel]
  );

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">FANTASY</span>
          <span>Leaderboard</span>
        </div>

        <h1 className="h1">{title}</h1>

        <p className="sub" style={{ maxWidth: 920 }}>
          A round leaderboard az adott playoff körre számolt, szorzóval növelt
          pontokat mutatja. A Playoff Total oszlop a kiválasztott körig összegzi az
          összes megszerzett pontot.
        </p>

        <div className="filters-bar" style={{ marginTop: 16 }}>
          <RoundDropdown value={round} options={rounds} onChange={setRound} />

          <div className="filters-spacer" />

          <Link to={`/fantasy/playoff-challenge?round=${round}`} className="btn primary">
            Back to Playoff Challenge
          </Link>
        </div>
      </div>

      {err ? (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      ) : null}

      <div className="grid" style={{ marginTop: 18 }}>
        <div className="col-12 card">
          <h3 className="card-title">Round standings</h3>
          <div className="muted" style={{ marginBottom: 12 }}>
            {roundLabel} · szorzóval növelt pontok
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Round Points</th>
                  <th>Selected</th>
                </tr>
              </thead>
              <tbody>
                {roundRows.map((row, idx) => (
                  <tr key={row.user.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <Link
                        to={`/fantasy/playoff-challenge?round=${round}&userId=${row.user.id}`}
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

                {!roundRows.length && (
                  <tr>
                    <td colSpan="4" className="muted">
                      Nincs adat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-12 card">
          <h3 className="card-title">Playoff total</h3>
          <div className="muted" style={{ marginBottom: 12 }}>
            Kumulált pontok a kiválasztott körig
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Total Points</th>
                  <th>Filled Slots</th>
                </tr>
              </thead>
              <tbody>
                {totals.map((row, idx) => (
                  <tr key={row.userId}>
                    <td>{idx + 1}</td>
                    <td>
                      <Link
                        to={`/fantasy/playoff-challenge?round=${round}&userId=${row.userId}`}
                        style={userLinkStyle}
                      >
                        {row.username}
                      </Link>
                    </td>
                    <td>{formatScore(row.points)}</td>
                    <td>{row.selectedCount}</td>
                  </tr>
                ))}

                {!totals.length && (
                  <tr>
                    <td colSpan="4" className="muted">
                      Nincs adat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}