import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

const SEASON = 2025;

function formatKickoff(iso) {
  const d = new Date(iso);
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
    // reuse schedule endpoint, mert ott megvan a “mely hetek vannak”
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
      // reload to reflect selection
      await loadWeek(week);
    } catch (e) {
      setErr(e?.response?.data?.error || "Hiba történt a mentésnél.");
    } finally {
      setSavingId(null);
    }
  }

  const pickedCount = useMemo(() => games.filter(g => g.picked).length, [games]);

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">FANTASY</span>
          <span>Weekly Pick&apos;Em</span>
        </div>
        <h1 className="h1">Weekly Pick&apos;Em</h1>
        <p className="sub">
          Tippeld meg a meccsek győztesét kickoff előtt. Kickoff után a választás tiltva.
        </p>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <div className="filters-group">
            <span className="filters-label">WEEK</span>
            <select className="select-dark" value={week} onChange={(e) => setWeek(Number(e.target.value))}>
              {weeks.map(w => <option key={w} value={w}>Week {w}</option>)}
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
        {games.map(g => {
          const disabled = !g.canPick || savingId === g.id;
          const final = g.final;

          // correct indicator
          let verdict = null;
          if (final && g.picked) verdict = g.correct ? "✅ Helyes" : "❌ Hibás";

          return (
            <div key={g.id} className="scheduleRow">
              <div className="scheduleRowBar" style={{ background: "rgba(60,130,255,.65)" }} />

              <div className="scheduleRowMain" style={{ gridTemplateColumns: "1.4fr .6fr" }}>
                {/* left: pick UI */}
                <div className="scheduleTeams" style={{ gap: 8 }}>
                  <div className="pickRow">
                    <button
                      className={`pickTeamBtn ${g.picked === g.awayTeam ? "selected" : ""}`}
                      disabled={disabled}
                      onClick={() => pick(g.id, g.awayTeam)}
                      title={disabled ? "Kickoff után nem módosítható" : "Válaszd a győztest"}
                    >
                      {g.awayTeam}
                    </button>

                    <div className="pickMeta muted">
                      {final ? "FINAL" : formatKickoff(g.kickoffAt)}
                    </div>

                    <button
                      className={`pickTeamBtn ${g.picked === g.homeTeam ? "selected" : ""}`}
                      disabled={disabled}
                      onClick={() => pick(g.id, g.homeTeam)}
                      title={disabled ? "Kickoff után nem módosítható" : "Válaszd a győztest"}
                    >
                      {g.homeTeam}
                    </button>
                  </div>

                  <div className="muted" style={{ fontSize: 12 }}>
                    {final
                      ? `Eredmény: ${g.awayTeam} ${g.awayScore} — ${g.homeScore} ${g.homeTeam}`
                      : `Kickoff: ${formatKickoff(g.kickoffAt)}`
                    }
                  </div>

                  {verdict && (
                    <div style={{ fontWeight: 900, fontSize: 13 }}>
                      {verdict}
                    </div>
                  )}
                </div>

                {/* right */}
                <div className="scheduleRight">
                  <div className={`statusPill ${final ? "final" : "scheduled"}`}>
                    {final ? "FINAL" : "SCHEDULED"}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {g.canPick ? "Open" : "Locked"}
                  </div>
                  <button className="btn scheduleBtn" disabled>
                    {savingId === g.id ? "Saving..." : "—"}
                  </button>
                </div>
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