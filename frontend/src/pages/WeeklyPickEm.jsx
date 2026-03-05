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
      setErr("");
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
          const isSaving = savingId === g.id;
          const canPick = !!g.canPick && !isSaving;
          const final = !!g.final;

          const leftSelected = g.picked === g.awayTeam;
          const rightSelected = g.picked === g.homeTeam;

          const leftClass = (() => {
            if (!leftSelected) return "";

            if (!g.final) return "gold";        // scheduled
            if (g.correct) return "correct";    // good pick
            return "wrong";                     // bad pick
          })();

          const rightClass = (() => {
            if (!rightSelected) return "";

            if (!g.final) return "gold";
            if (g.correct) return "correct";
            return "wrong";
          })();

          const leftScore = final ? g.awayScore : "—";
          const rightScore = final ? g.homeScore : "—";

          let verdict = null;
          if (final && g.picked) verdict = g.correct ? "✅ Helyes tipp" : "❌ Hibás tipp";

          return (
            <div key={g.id} className="scheduleRow">
              <div className="scheduleRowBar" style={{ background: "rgba(60,130,255,.65)" }} />

              <div className="scheduleRowMain" style={{ gridTemplateColumns: "1fr" }}>
                {/* NFL-like single row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 220px 1fr",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  {/* LEFT: AWAY */}
                  <button
                    className={`pickTeamBtn ${leftClass}`}
                    disabled={!canPick}
                    onClick={() => pick(g.id, g.awayTeam)}
                    title={!g.canPick ? "Kickoff után nem módosítható" : "Válaszd a győztest"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 14px",
                    }}
                  >
                    <span style={{ fontWeight: 900, letterSpacing: ".4px" }}>{g.awayTeam}</span>
                    <span style={{ fontWeight: 900, opacity: final ? 1 : 0.65 }}>{leftScore}</span>
                  </button>

                  {/* CENTER: STATUS */}
                  <div style={{ textAlign: "center" }}>
                    <div className={`statusPill ${final ? "final" : "scheduled"}`} style={{ justifyContent: "center" }}>
                      {final ? "FINAL" : formatKickoff(g.kickoffAt)}
                    </div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                      {g.canPick ? (isSaving ? "Saving..." : "Open") : "Locked"}
                    </div>
                    {verdict && (
                      <div style={{ marginTop: 6, fontWeight: 900, fontSize: 12 }}>
                        {verdict}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: HOME */}
                  <button
                    className={`pickTeamBtn ${rightClass}`}
                    disabled={!canPick}
                    onClick={() => pick(g.id, g.homeTeam)}
                    title={!g.canPick ? "Kickoff után nem módosítható" : "Válaszd a győztest"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 14px",
                    }}
                  >
                    <span style={{ fontWeight: 900, opacity: final ? 1 : 0.65 }}>{rightScore}</span>
                    <span style={{ fontWeight: 900, letterSpacing: ".4px" }}>{g.homeTeam}</span>
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