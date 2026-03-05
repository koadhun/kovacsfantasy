import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";
import TeamLogo from "../components/TeamLogo";

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

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {games.map((g) => {
          const isSaving = savingId === g.id;
          const canPick = !!g.canPick && !isSaving;
          const final = !!g.final;

          // a jelenlegi szabályod: ha selected és scheduled → gold; ha final → green/red
          const leftSelected = g.picked === g.awayTeam;
          const rightSelected = g.picked === g.homeTeam;

          const leftClass = (() => {
            if (!leftSelected) return "";
            if (!final) return "gold";
            return g.correct ? "correct" : "wrong";
          })();

          const rightClass = (() => {
            if (!rightSelected) return "";
            if (!final) return "gold";
            return g.correct ? "correct" : "wrong";
          })();

          const leftScore = final ? g.awayScore : "—";
          const rightScore = final ? g.homeScore : "—";

          let verdict = null;
          if (final && g.picked) verdict = g.correct ? "✅ Helyes tipp" : "❌ Hibás tipp";

          return (
            <div key={g.id} className="scheduleRow">
              <div className="scheduleRowBar" style={{ background: "rgba(60,130,255,.65)" }} />

              <div className="scheduleRowMain" style={{ gridTemplateColumns: "1fr", gap: 10 }}>
                {/* 1 sor / meccs: LEFT | CENTER | RIGHT */}
                <div className="pickRow">
                  <button
                    className={`pickTeamBtn ${leftSelected ? "selected" : ""}`}
                    style={{
                      borderColor:
                        leftClass === "correct"
                          ? "rgba(34,197,94,.55)"
                          : leftClass === "wrong"
                          ? "rgba(225,29,72,.60)"
                          : leftClass === "gold"
                          ? "rgba(245,158,11,.65)"
                          : undefined,
                      boxShadow:
                        leftClass === "correct"
                          ? "inset 0 0 0 1px rgba(34,197,94,.35)"
                          : leftClass === "wrong"
                          ? "inset 0 0 0 1px rgba(225,29,72,.35)"
                          : leftClass === "gold"
                          ? "inset 0 0 0 1px rgba(245,158,11,.35)"
                          : undefined,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "0 14px",
                    }}
                    disabled={!canPick}
                    onClick={() => pick(g.id, g.awayTeam)}
                    title={!g.canPick ? "Kickoff után nem módosítható" : "Válaszd a győztest"}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                      <TeamLogo team={g.awayTeam} size={22} />
                      <span style={{ fontWeight: 900 }}>{g.awayTeam}</span>
                    </span>
                    <span style={{ fontWeight: 900 }}>{leftScore}</span>
                  </button>

                  <div className="pickMeta muted" style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 900 }}>{final ? "FINAL" : formatKickoff(g.kickoffAt)}</div>
                    <div style={{ opacity: 0.9 }}>{g.canPick ? (isSaving ? "Saving..." : "Open") : "Locked"}</div>
                  </div>

                  <button
                    className={`pickTeamBtn ${rightSelected ? "selected" : ""}`}
                    style={{
                      borderColor:
                        rightClass === "correct"
                          ? "rgba(34,197,94,.55)"
                          : rightClass === "wrong"
                          ? "rgba(225,29,72,.60)"
                          : rightClass === "gold"
                          ? "rgba(245,158,11,.65)"
                          : undefined,
                      boxShadow:
                        rightClass === "correct"
                          ? "inset 0 0 0 1px rgba(34,197,94,.35)"
                          : rightClass === "wrong"
                          ? "inset 0 0 0 1px rgba(225,29,72,.35)"
                          : rightClass === "gold"
                          ? "inset 0 0 0 1px rgba(245,158,11,.35)"
                          : undefined,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "0 14px",
                    }}
                    disabled={!canPick}
                    onClick={() => pick(g.id, g.homeTeam)}
                    title={!g.canPick ? "Kickoff után nem módosítható" : "Válaszd a győztest"}
                  >
                    <span style={{ fontWeight: 900 }}>{rightScore}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 900 }}>{g.homeTeam}</span>
                      <TeamLogo team={g.homeTeam} size={22} />
                    </span>
                  </button>
                </div>

                {verdict && <div style={{ fontWeight: 900, fontSize: 13 }}>{verdict}</div>}
              </div>
            </div>
          );
        })}

        {!games.length && !err && (
          <div className="card" style={{ padding: 14 }}>
            <div className="muted">Ehhez a héthez nincs schedule adat.</div>
          </div>
        )}
      </div>
    </div>
  );
}