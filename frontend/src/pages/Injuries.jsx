import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import TeamLogo from "../components/TeamLogo";
import SimpleDropdown from "../components/SimpleDropdown";

const TEAM_NAMES = {
  ARI: "Arizona Cardinals", ATL: "Atlanta Falcons", BAL: "Baltimore Ravens",
  BUF: "Buffalo Bills", CAR: "Carolina Panthers", CHI: "Chicago Bears",
  CIN: "Cincinnati Bengals", CLE: "Cleveland Browns", DAL: "Dallas Cowboys",
  DEN: "Denver Broncos", DET: "Detroit Lions", GB: "Green Bay Packers",
  HOU: "Houston Texans", IND: "Indianapolis Colts", JAX: "Jacksonville Jaguars",
  KC: "Kansas City Chiefs", LV: "Las Vegas Raiders", LAC: "Los Angeles Chargers",
  LAR: "Los Angeles Rams", MIA: "Miami Dolphins", MIN: "Minnesota Vikings",
  NE: "New England Patriots", NO: "New Orleans Saints", NYG: "New York Giants",
  NYJ: "New York Jets", PHI: "Philadelphia Eagles", PIT: "Pittsburgh Steelers",
  SEA: "Seattle Seahawks", SF: "San Francisco 49ers", TB: "Tampa Bay Buccaneers",
  TEN: "Tennessee Titans", WAS: "Washington Commanders",
};

const STATUS_COLORS = {
  Out: { bg: "rgba(239,68,68,.16)", border: "rgba(239,68,68,.35)", text: "#fca5a5" },
  Doubtful: { bg: "rgba(249,115,22,.16)", border: "rgba(249,115,22,.35)", text: "#fdba74" },
  Questionable: { bg: "rgba(234,179,8,.16)", border: "rgba(234,179,8,.35)", text: "#fde047" },
  "I.L.": { bg: "rgba(148,163,184,.16)", border: "rgba(148,163,184,.35)", text: "#cbd5e1" },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || {
    bg: "rgba(148,163,184,.16)",
    border: "rgba(148,163,184,.35)",
    text: "#cbd5e1",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "5px 11px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

export default function Injuries() {
  const [injuries, setInjuries] = useState([]);
  const [team, setTeam] = useState("ALL");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true);
    setErr("");
    api
      .get("/injuries")
      .then((res) => setInjuries(res.data.injuries || []))
      .catch(() => setErr("Was unable to load injury reports."))
      .finally(() => setLoading(false));
  }, []);

  const teamOptions = useMemo(() => {
    const codes = [...new Set(injuries.map((i) => i.teamCode))].sort();
    return [
      { value: "ALL", label: "All teams" },
      ...codes.map((c) => ({ value: c, label: TEAM_NAMES[c] || c })),
    ];
  }, [injuries]);

  const filtered = useMemo(() => {
    return injuries.filter((i) => {
      if (team !== "ALL" && i.teamCode !== team) return false;
      if (q && !i.playerName.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [injuries, team, q]);

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">INJURIES</span>
          <span>Injury Report</span>
        </div>
        <h1 className="h1">Injuries</h1>
        <p className="sub">Available injury reports</p>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <SimpleDropdown
            value={team}
            options={teamOptions}
            onChange={setTeam}
            label="TEAM"
            width={220}
          />

          <div className="filters-group" style={{ minWidth: 280 }}>
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
            {filtered.length} results
          </span>
        </div>
      </div>

      {loading && <p className="muted" style={{ marginTop: 14 }}>Betoltes...</p>}
      {err && <p className="error" style={{ marginTop: 14 }}>{err}</p>}

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {filtered.map((inj) => (
          <div
            key={inj.id}
            className="card"
            style={{
              padding: 14,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            {inj.headshotUrl ? (
              <img
                src={inj.headshotUrl}
                alt={inj.playerName}
                style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,.06)",
                }}
              />
            )}

            <TeamLogo team={inj.teamCode} size={26} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{inj.playerName}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                {TEAM_NAMES[inj.teamCode] || inj.teamCode} - {inj.description}
              </div>
            </div>

            <StatusBadge status={inj.status} />
          </div>
        ))}

        {!loading && !filtered.length && !err && (
          <div className="card" style={{ padding: 14 }}>
            <div className="muted">No results.</div>
          </div>
        )}
      </div>
    </div>
  );
}