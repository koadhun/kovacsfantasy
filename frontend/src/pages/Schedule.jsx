import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import TeamLogo from "../components/TeamLogo";

const SEASON = 2025;

const TEAM_NAMES = {
  ARI: "Arizona Cardinals",
  ATL: "Atlanta Falcons",
  BAL: "Baltimore Ravens",
  BUF: "Buffalo Bills",
  CAR: "Carolina Panthers",
  CHI: "Chicago Bears",
  CIN: "Cincinnati Bengals",
  CLE: "Cleveland Browns",
  DAL: "Dallas Cowboys",
  DEN: "Denver Broncos",
  DET: "Detroit Lions",
  GB: "Green Bay Packers",
  HOU: "Houston Texans",
  IND: "Indianapolis Colts",
  JAX: "Jacksonville Jaguars",
  KC: "Kansas City Chiefs",
  LV: "Las Vegas Raiders",
  LAC: "Los Angeles Chargers",
  LAR: "Los Angeles Rams",
  MIA: "Miami Dolphins",
  MIN: "Minnesota Vikings",
  NE: "New England Patriots",
  NO: "New Orleans Saints",
  NYG: "New York Giants",
  NYJ: "New York Jets",
  PHI: "Philadelphia Eagles",
  PIT: "Pittsburgh Steelers",
  SEA: "Seattle Seahawks",
  SF: "San Francisco 49ers",
  TB: "Tampa Bay Buccaneers",
  TEN: "Tennessee Titans",
  WAS: "Washington Commanders",
};

function teamName(team) {
  return TEAM_NAMES[String(team || "").toUpperCase()] || team || "-";
}

function formatDay(iso) {
  const d = new Date(iso);
  return d
    .toLocaleDateString(undefined, { month: "short", day: "numeric" })
    .toUpperCase();
}

function formatKickoff(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString(undefined, { weekday: "short" });
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} ${time}`;
}

function isFinal(game) {
  return game.status === "FINAL" && game.homeScore != null && game.awayScore != null;
}

function winnerSide(game) {
  if (!isFinal(game)) return null;
  if (game.homeScore === game.awayScore) return "TIE";
  return game.homeScore > game.awayScore ? "HOME" : "AWAY";
}

const TEAM_COLOR = {
  LAR: "#2563EB",
  DET: "#60A5FA",
  KC: "#EF4444",
  SF: "#F59E0B",
  PHI: "#10B981",
  DAL: "#38BDF8",
  BUF: "#3B82F6",
  NYJ: "#22C55E",
};

function teamBar(team) {
  return TEAM_COLOR[(team || "").toUpperCase()] || "rgba(99,102,241,.9)";
}

function TeamScoreRow({ team, score, highlighted = false, winner = false }) {
  return (
    <div
      className="pickTeamBtn"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        padding: "0 16px",
        minHeight: 56,
        borderColor: winner
          ? "rgba(34,197,94,.60)"
          : highlighted
          ? "rgba(59,130,246,.45)"
          : "rgba(255,255,255,.12)",
        background: winner
          ? "linear-gradient(180deg, rgba(34,197,94,.18), rgba(34,197,94,.08))"
          : highlighted
          ? "rgba(20,40,90,.28)"
          : undefined,
        boxShadow: winner
          ? "inset 0 0 0 1px rgba(34,197,94,.28)"
          : undefined,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          minWidth: 0,
          flex: 1,
        }}
      >
        <TeamLogo team={team} size={22} />
        <span
          style={{
            fontWeight: winner ? 900 : 800,
            fontSize: 18,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {teamName(team)}
        </span>
      </div>

      <div
        style={{
          fontWeight: 900,
          fontSize: 18,
          minWidth: 24,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {score}
      </div>
    </div>
  );
}

export default function Schedule() {
  const [weeks, setWeeks] = useState([]);
  const [week, setWeek] = useState(1);
  const [games, setGames] = useState([]);
  const [err, setErr] = useState("");

  async function loadWeeks() {
    const res = await api.get("/schedule/weeks", {
      params: { season: SEASON },
    });
    const ws = res.data.weeks || [];
    setWeeks(ws);
    if (ws.length && !ws.includes(week)) setWeek(ws[0]);
  }

  async function loadWeekGames(w) {
    setErr("");
    const res = await api.get("/schedule/by-week", {
      params: { season: SEASON, week: w },
    });
    setGames(res.data.games || []);
  }

  useEffect(() => {
    loadWeeks().catch(() => setErr("Nem sikerült betölteni a heteket."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadWeekGames(week).catch(() => setErr("Nem sikerült betölteni a meccseket."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);

  const headerTitle = useMemo(
    () => `Schedule · ${SEASON} · Week ${week}`,
    [week]
  );

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">SCHEDULE</span>
          <span>By Week</span>
        </div>

        <h1 className="h1">{headerTitle}</h1>

        <p className="sub">
          BY WEEK nézet — lejátszott meccsnél eredmény (FINAL), jövőbeninél kezdési idő.
        </p>

        <div className="filters-bar">
          <div className="filters-group">
            <span className="filters-label">WEEK</span>
            <select
              className="select-dark"
              value={week}
              onChange={(e) => setWeek(Number(e.target.value))}
              disabled={!weeks.length}
            >
              {weeks.map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>
          </div>

          <div className="filters-spacer" />

          <span className="pill">
            <span className="dot" />
            {games.length} games
          </span>
        </div>
      </div>

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        {games.map((g) => {
          const final = isFinal(g);
          const win = winnerSide(g);
          const leftColor = teamBar(g.awayTeam);

          return (
            <div key={g.id} className="scheduleRow">
              <div
                className="scheduleRowBar"
                style={{ background: leftColor }}
              />

              <div
                className="scheduleRowMain"
                style={{
                  gridTemplateColumns: "1.45fr 220px",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    minWidth: 0,
                    paddingRight: 12,
                    borderRight: "1px solid rgba(255,255,255,.08)",
                  }}
                >
                  <TeamScoreRow
                    team={g.awayTeam}
                    score={final ? g.awayScore : "—"}
                    highlighted={!final}
                    winner={final && win === "AWAY"}
                  />

                  <TeamScoreRow
                    team={g.homeTeam}
                    score={final ? g.homeScore : "—"}
                    highlighted={!final}
                    winner={final && win === "HOME"}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    justifyItems: "end",
                    gap: 10,
                    minWidth: 0,
                  }}
                >
                  <span className="pill" style={{ fontWeight: 800 }}>
                    {final ? "FINAL" : formatKickoff(g.kickoffAt)}
                  </span>

                  <div className="muted" style={{ fontWeight: 700 }}>
                    {formatDay(g.kickoffAt)}
                  </div>

                  <button className="btn">Details</button>
                </div>
              </div>
            </div>
          );
        })}

        {!games.length && !err && (
          <div className="card" style={{ padding: 14 }}>
            <div className="muted">Ehhez a héthez nincs adat.</div>
          </div>
        )}
      </div>
    </div>
  );
}