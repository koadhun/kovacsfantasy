import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

const SEASON = 2025;

function safeDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (!isNaN(d.getTime())) return d;

  // fallback: "2025-09-10 20:15" -> "2025-09-10T20:15"
  const d2 = new Date(String(iso).replace(" ", "T"));
  if (!isNaN(d2.getTime())) return d2;

  return null;
}

function formatKickoff(iso) {
  const d = safeDate(iso);
  if (!d) return "SCHEDULED";
  const day = d.toLocaleDateString(undefined, { weekday: "short" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${day} ${time}`;
}

export default function WeeklyPickEm() {
  const [week, setWeek] = useState(1);
  const [weeks, setWeeks] = useState([]);
  const [games, setGames] = useState([]);
  const [err, setErr] = useState("");
  const [savingId, setSavingId] = useState(null);

  async function loadWeeks() {
    const res = await api.get("/schedule/weeks", { params: { season: SEASON } });
    const ws = res.data.weeks || [];
    setWeeks(ws);
    if (ws.length) setWeek(ws[0]);
  }

  async function loadWeek(w) {
    setErr("");
    const res = await api.get("/pickem/week", { params: { season: SEASON, week: w } });
    setGames(res.data.games || []);
  }

  useEffect(() => {
    loadWeeks().catch(() => setErr("Nem sikerült betölteni a heteket."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!week) return;
    loadWeek(week).catch(() => setErr("Nem sikerült betölteni a meccseket."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);

  async function pick(gameId, team) {
    try {
      setSavingId(gameId);
      await api.post("/pickem/pick", { gameId, picked: team });
      await loadWeek(week);
    } catch (e) {
      setErr(e?.response?.data?.error || "Hiba történt a mentésnél.");
    } finally {
      setSavingId(null);
    }
  }

  const pickedCount = useMemo(() => games.filter((g) => g.picked).length, [games]);

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">FANTASY</span>
          <span>Weekly Pick&apos;Em</span>
        </div>
        <h1 className="h1">Weekly Pick&apos;Em</h1>
        <p className="sub">Tippeld meg a meccsek győztesét kickoff előtt. Kickoff után a választás tiltva.</p>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <div className="filters-group">
            <span className="filters-label">WEEK</span>
            <select className="select-dark" value={week} onChange={(e) => setWeek(Number(e.target.value))}>
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
            {pickedCount}/{games.length} picked
          </span>

          <Link to={`/fantasy/weekly-pickem/leaderboard?week=${week}`} className="btn primary">
            Leaderboard
          </Link>
        </div>
      </div>

      {err && <p className="error" style={{ marginTop: 14 }}>{err}</p>}

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {games.map((g) => {
          const final = !!g.final;

          // ✅ lockolás: kickoff alapján (nem canPick alapján!)
          const kickoff = safeDate(g.kickoffAt);
          const kickoffPassed = kickoff ? Date.now() >= kickoff.getTime() : false;

          // ha final vagy kickoff elmúlt → locked
          // plusz: ha backend adott canPick=false-t, akkor is locked
          const locked = final || kickoffPassed || g.canPick === false;

          const disabledAway = locked || savingId === g.id;
          const disabledHome = locked || savingId === g.id;

          // correct indicator
          let verdict = null;
          if (final && g.picked) verdict = g.correct ? "✅ Helyes" : "❌ Hibás";

          // Scores külön
          const awayScore = typeof g.awayScore === "number" ? g.awayScore : (g.awayScore ?? "");
          const homeScore = typeof g.homeScore === "number" ? g.homeScore : (g.homeScore ?? "");

          // Middle text: FINAL vagy kickoff
          const middleText = final ? "FINAL" : formatKickoff(g.kickoffAt);

          return (
            <div key={g.id} className="scheduleRow">
              <div className="scheduleRowBar" style={{ background: "rgba(60,130,255,.65)" }} />

              {/* ✅ ÚJ 3 oszlopos layout: LEFT | MIDDLE | RIGHT */}
              <div
                className="scheduleRowMain"
                style={{
                  gridTemplateColumns: "1fr auto 1fr",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                {/* LEFT: AWAY (TEAM + SCORE külön) */}
                <button
                  className={`pickTeamBtn ${g.picked === g.awayTeam ? "selected" : ""}`}
                  disabled={disabledAway}
                  onClick={() => pick(g.id, g.awayTeam)}
                  title={locked ? "Kickoff után nem módosítható" : "Válaszd a győztest"}
                  style={{ justifySelf: "start", minWidth: 220 }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontWeight: 900 }}>{g.awayTeam}</span>
                    {final && <span style={{ fontWeight: 900 }}>{awayScore}</span>}
                  </div>
                </button>

                {/* MIDDLE */}
                <div style={{ textAlign: "center", minWidth: 180 }}>
                  <div className={`statusPill ${final ? "final" : "scheduled"}`}>
                    {middleText}
                  </div>

                  {verdict && (
                    <div style={{ fontWeight: 900, fontSize: 13, marginTop: 8 }}>
                      {verdict}
                    </div>
                  )}

                  {!final && g.picked && (
                    <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                      Picked: <span style={{ fontWeight: 900 }}>{g.picked}</span>
                    </div>
                  )}

                  <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                    {locked ? "Locked" : "Open"}
                  </div>
                </div>

                {/* RIGHT: HOME (SCORE + TEAM külön) */}
                <button
                  className={`pickTeamBtn ${g.picked === g.homeTeam ? "selected" : ""}`}
                  disabled={disabledHome}
                  onClick={() => pick(g.id, g.homeTeam)}
                  title={locked ? "Kickoff után nem módosítható" : "Válaszd a győztest"}
                  style={{ justifySelf: "end", minWidth: 220 }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    {final && <span style={{ fontWeight: 900 }}>{homeScore}</span>}
                    <span style={{ fontWeight: 900 }}>{g.homeTeam}</span>
                  </div>
                </button>
              </div>
            </div>
          );
        })}

        {!games.length && (
          <div className="card" style={{ padding: 14 }}>
            <div className="muted">Ehhez a héthez nincs schedule adat.</div>
          </div>
        )}
      </div>
    </div>
  );
}