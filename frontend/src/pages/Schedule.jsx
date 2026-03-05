import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import TeamLogo from "../components/TeamLogo";

const SEASON = 2025;

function formatDay(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase();
}

function formatKickoff(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString(undefined, { weekday: "short" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
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

// nem hivatalos “team color” csík – bővíthető, ha akarsz
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

export default function Schedule() {
  const [weeks, setWeeks] = useState([]);
  const [week, setWeek] = useState(1);
  const [games, setGames] = useState([]);
  const [err, setErr] = useState("");

  async function loadWeeks() {
    const res = await api.get("/schedule/weeks", { params: { season: SEASON } });
    const ws = res.data.weeks || [];
    setWeeks(ws);
    if (ws.length && !ws.includes(week)) setWeek(ws[0]);
  }

  async function loadWeekGames(w) {
    setErr("");
    const res = await api.get("/schedule/by-week", { params: { season: SEASON, week: w } });
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

  const headerTitle = useMemo(() => `Schedule · ${SEASON} · Week ${week}`, [week]);

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

        <div className="filters-bar" style={{ marginTop: 14 }}>
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

      {err && <p className="error" style={{ marginTop: 14 }}>{err}</p>}

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {games.map((g) => {
          const final = isFinal(g);
          const win = winnerSide(g);
          const leftColor = teamBar(g.awayTeam);

          return (
            <div key={g.id} className="scheduleRow">
              <div className="scheduleRowBar" style={{ background: leftColor }} />

              <div className="scheduleRowMain">
                <div className="scheduleTeams">
                  {/* AWAY */}
                  <div className={`scheduleTeam ${win === "AWAY" ? "winner" : ""}`}>
                    <div className="teamCode" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <TeamLogo team={g.awayTeam} size={26} />
                      <span>{g.awayTeam}</span>
                    </div>

                    <div className="teamMeta">
                      <div className="teamName">{g.awayTeam}</div>
                      <div className="teamSub muted">{final ? "FINAL" : "SCHEDULED"}</div>
                    </div>

                    <div className="teamScore">{final ? g.awayScore : "—"}</div>
                  </div>

                  {/* HOME */}
                  <div className={`scheduleTeam ${win === "HOME" ? "winner" : ""}`}>
                    <div className="teamCode" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <TeamLogo team={g.homeTeam} size={26} />
                      <span>{g.homeTeam}</span>
                    </div>

                    <div className="teamMeta">
                      <div className="teamName">{g.homeTeam}</div>
                      <div className="teamSub muted">{final ? "FINAL" : "KICKOFF"}</div>
                    </div>

                    <div className="teamScore">{final ? g.homeScore : "—"}</div>
                  </div>
                </div>

                <div className="scheduleRight">
                  <div className={`statusPill ${final ? "final" : "scheduled"}`}>
                    {final ? "FINAL" : formatKickoff(g.kickoffAt)}
                  </div>
                  <div className="muted scheduleDate">{formatDay(g.kickoffAt)}</div>

                  <button className="btn scheduleBtn" disabled>
                    Details
                  </button>
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