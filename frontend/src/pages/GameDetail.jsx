import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import TeamLogo from "../components/TeamLogo";

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

const SECTIONS = [
  {
    key: "passing", title: "Passing",
    columns: [
      { key: "player", label: "Player" },
      { key: "cmp", label: "Cmp" },
      { key: "att", label: "Att" },
      { key: "yds", label: "Yds" },
      { key: "cmpPct", label: "Cmp%" },
      { key: "avg", label: "Avg" },
      { key: "td", label: "TD" },
      { key: "int", label: "Int" },
      { key: "sck", label: "Sacks" },
      { key: "rating", label: "Rating" },
    ],
  },
  {
    key: "rushing", title: "Rushing",
    columns: [
      { key: "player", label: "Player" },
      { key: "att", label: "Att" },
      { key: "yds", label: "Yds" },
      { key: "td", label: "TD" },
      { key: "avg", label: "Avg" },
      { key: "long", label: "Long" },
    ],
  },
  {
    key: "receiving", title: "Receiving",
    columns: [
      { key: "player", label: "Player" },
      { key: "rec", label: "Rec" },
      { key: "yds", label: "Yds" },
      { key: "td", label: "TD" },
      { key: "tgts", label: "Tgts" },
      { key: "long", label: "Long" },
      { key: "avg", label: "Avg" },
    ],
  },
  {
    key: "fumbles", title: "Fumbles",
    columns: [
      { key: "player", label: "Player" },
      { key: "fum", label: "Fum" },
      { key: "lost", label: "Lost" },
      { key: "rec", label: "FR" },
    ],
  },
  {
    key: "defense", title: "Defense",
    columns: [
      { key: "player", label: "Player" },
      { key: "tot", label: "Tot" },
      { key: "solo", label: "Solo" },
      { key: "sacks", label: "Sacks" },
      { key: "tfl", label: "TFL" },
      { key: "pd", label: "PD" },
      { key: "qbHits", label: "QB Hits" },
      { key: "ff", label: "FF" },
    ],
  },
  {
    key: "kicking", title: "Kicking",
    columns: [
      { key: "player", label: "Player" },
      { key: "fgm", label: "FGM" },
      { key: "fga", label: "FGA" },
      { key: "pct", label: "FG%" },
      { key: "long", label: "Long" },
      { key: "xpm", label: "XPM" },
      { key: "xpa", label: "XPA" },
      { key: "pts", label: "Pts" },
    ],
  },
  {
    key: "punting", title: "Punting",
    columns: [
      { key: "player", label: "Player" },
      { key: "total", label: "Punts" },
      { key: "yds", label: "Yds" },
      { key: "avg", label: "Avg" },
      { key: "tb", label: "TB" },
      { key: "in20", label: "In20" },
      { key: "long", label: "Long" },
    ],
  },
  {
    key: "kickReturns", title: "Kick Returns",
    columns: [
      { key: "player", label: "Player" },
      { key: "total", label: "Ret" },
      { key: "yds", label: "Yds" },
      { key: "avg", label: "Avg" },
      { key: "long", label: "Long" },
      { key: "td", label: "TD" },
    ],
  },
];

function teamName(code) {
  return TEAM_NAMES[String(code || "").toUpperCase()] || code || "-";
}

function StatTable({ section, teamBox }) {
  const data = teamBox?.[section.key];
  const rows = data?.rows || [];

  if (!rows.length) return null;

  return (
    <div className="card" style={{ padding: 14, marginBottom: 12 }}>
      <h4 style={{ marginTop: 0, marginBottom: 10 }}>{section.title}</h4>
      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              {section.columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                {section.columns.map((c) => (
                  <td key={c.key}>{r[c.key]}</td>
                ))}
              </tr>
            ))}
            <tr style={{ fontWeight: 800, borderTop: "1px solid rgba(255,255,255,.15)" }}>
              {section.columns.map((c) => (
                <td key={c.key}>{data.total[c.key]}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamColumn({ title, teamBox }) {
  return (
    <div>
      <h3 style={{ marginBottom: 12 }}>{title}</h3>
      {SECTIONS.map((section) => (
        <StatTable key={section.key} section={section} teamBox={teamBox} />
      ))}
    </div>
  );
}

export default function GameDetail() {
  const { gameId } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setErr("");
    api
      .get(`/schedule/game/${gameId}`)
      .then((res) => setData(res.data))
      .catch(() => setErr("Nem sikerült betölteni a meccs statisztikáit."))
      .finally(() => setLoading(false));
  }, [gameId]);

  const game = data?.game;

  const dateLabel = useMemo(() => {
    if (!game) return "";
    return new Date(game.kickoffAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }, [game]);

  return (
    <div className="container page">
      <Link to="/schedule" className="btn" style={{ marginBottom: 14, display: "inline-block" }}>
        ← Back to Schedule
      </Link>

      {loading && <p className="muted">Betöltés...</p>}
      {err && <p className="error">{err}</p>}

      {game && (
        <div className="hero" style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <TeamLogo team={game.awayTeam} size={40} />
              <div>
                <div style={{ fontWeight: 900, fontSize: 20 }}>{teamName(game.awayTeam)}</div>
                <div style={{ fontSize: 28, fontWeight: 900 }}>{game.awayScore ?? "-"}</div>
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div className="pill">
                {game.season} · Week {game.week}
              </div>
              <div className="muted" style={{ marginTop: 6 }}>{dateLabel}</div>
              <div style={{ marginTop: 6, fontWeight: 800 }}>{game.status}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 900, fontSize: 20 }}>{teamName(game.homeTeam)}</div>
                <div style={{ fontSize: 28, fontWeight: 900 }}>{game.homeScore ?? "-"}</div>
              </div>
              <TeamLogo team={game.homeTeam} size={40} />
            </div>
          </div>
        </div>
      )}

      {data?.boxscore ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          <TeamColumn title={teamName(game.awayTeam)} teamBox={data.boxscore.away} />
          <TeamColumn title={teamName(game.homeTeam)} teamBox={data.boxscore.home} />
        </div>
      ) : (
        !loading && !err && (
          <p className="muted">
            {data?.message || "Ehhez a meccshez még nincs részletes statisztika."}
          </p>
        )
      )}
    </div>
  );
}