import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link, useSearchParams } from "react-router-dom";
import TeamLogo from "../components/TeamLogo";
import WeekDropdown from "../components/WeekDropdown";

const SEASON = 2025;

function formatKickoff(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString(undefined, { weekday: "short" });
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} ${time}`;
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function WeeklyPickEm() {
  const [sp, setSp] = useSearchParams();
  const requestedWeek = Number(sp.get("week") || 1);

  const [week, setWeek] = useState(requestedWeek);
  const [weeks, setWeeks] = useState([]);
  const [games, setGames] = useState([]);
  const [err, setErr] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [loadingWeeks, setLoadingWeeks] = useState(true);
  const [loadingGames, setLoadingGames] = useState(false);

  const [myWeeklyScore, setMyWeeklyScore] = useState(null);
  const [mySeasonScore, setMySeasonScore] = useState(null);

  const currentUser = useMemo(() => readStoredUser(), []);
  const currentUserId = currentUser?.id || null;

  async function loadWeeks() {
    setLoadingWeeks(true);

    const res = await api.get("/schedule/weeks", {
      params: { season: SEASON },
    });

    const ws = Array.isArray(res.data?.weeks) ? res.data.weeks : [];
    setWeeks(ws);

    if (!ws.length) {
      setWeek(1);
      return;
    }

    const safeWeek = ws.includes(requestedWeek) ? requestedWeek : ws[0];
    setWeek(safeWeek);
  }

  async function loadWeek(w) {
    setErr("");
    setLoadingGames(true);

    try {
      const res = await api.get("/pickem/week", {
        params: { season: SEASON, week: w },
      });
      setGames(res.data.games || []);
    } catch (e) {
      setGames([]);
      setErr(
        e?.response?.data?.error ||
          e?.message ||
          "Nem sikerült betölteni a meccseket."
      );
    } finally {
      setLoadingGames(false);
    }
  }

  async function loadMyScores(w) {
    try {
      const res = await api.get("/pickem/leaderboard", {
        params: { season: SEASON, week: w },
      });

      const weekly = Array.isArray(res.data?.weekly) ? res.data.weekly : [];
      const totals = Array.isArray(res.data?.totals) ? res.data.totals : [];

      const myWeekly =
        weekly.find((row) => String(row?.user?.id) === String(currentUserId)) ||
        null;

      const myTotal =
        totals.find((row) => String(row?.userId) === String(currentUserId)) ||
        null;

      setMyWeeklyScore(
        myWeekly
          ? {
              points: myWeekly.points ?? 0,
              correct: myWeekly.correct ?? 0,
              totalGames: myWeekly.totalGames ?? 0,
            }
          : {
              points: 0,
              correct: 0,
              totalGames: games.length || 0,
            }
      );

      setMySeasonScore(
        myTotal
          ? {
              points: myTotal.points ?? 0,
              correct: myTotal.correct ?? 0,
              totalGames: myTotal.totalGames ?? 0,
            }
          : {
              points: 0,
              correct: 0,
              totalGames: 0,
            }
      );
    } catch {
      setMyWeeklyScore(null);
      setMySeasonScore(null);
    }
  }

  async function refreshPageData(targetWeek) {
    await Promise.all([loadWeek(targetWeek), loadMyScores(targetWeek)]);
  }

  useEffect(() => {
    loadWeeks()
      .catch(() => setErr("Nem sikerült betölteni a heteket."))
      .finally(() => setLoadingWeeks(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!week) return;

    const currentQueryWeek = Number(sp.get("week") || 0);
    if (currentQueryWeek !== week) {
      setSp({ week: String(week) }, { replace: true });
    }

    refreshPageData(week).catch(() =>
      setErr("Nem sikerült betölteni a meccseket.")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);

  async function pick(gameId, team) {
    try {
      setErr("");
      setSavingId(gameId);
      await api.post("/pickem/pick", { gameId, picked: team });
      await refreshPageData(week);
    } catch (e) {
      setErr(e?.response?.data?.error || "Hiba történt a mentésnél.");
    } finally {
      setSavingId(null);
    }
  }

  const pickedCount = useMemo(
    () => games.filter((g) => g.picked).length,
    [games]
  );

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">FANTASY</span>
          <span>Weekly Pick&apos;Em</span>
        </div>

        <h1 className="h1">Weekly Pick&apos;Em</h1>

        <p className="sub">
          Tippeld meg a meccsek győztesét kickoff előtt. Kickoff után a választás
          tiltva.
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

          {myWeeklyScore && (
            <span className="pill" title="Saját heti pontszám">
              <span className="dot" />
              Week points: {myWeeklyScore.points}
            </span>
          )}

          {mySeasonScore && (
            <span className="pill" title="Saját szezon összpontszám">
              <span className="dot" />
              Total points: {mySeasonScore.points}
            </span>
          )}

          <span className="pill">
            <span className="dot" />
            {pickedCount}/{games.length} picked
          </span>

          <Link
            to={`/fantasy/weekly-pickem/leaderboard?week=${week}`}
            className="btn primary"
          >
            Leaderboard
          </Link>
        </div>

        {(myWeeklyScore || mySeasonScore) && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {myWeeklyScore && (
              <span className="pill">
                <span className="dot" />
                This week: {myWeeklyScore.correct}/{myWeeklyScore.totalGames} correct
              </span>
            )}

            {mySeasonScore && (
              <span className="pill">
                <span className="dot" />
                Season total: {mySeasonScore.correct}/{mySeasonScore.totalGames} correct
              </span>
            )}
          </div>
        )}
      </div>

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      {loadingGames && !games.length && !err && (
        <p className="muted" style={{ marginTop: 14 }}>
          Meccsek betöltése…
        </p>
      )}

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {games.map((g) => {
          const isSaving = savingId === g.id;
          const canPick = !!g.canPick && !isSaving;
          const final = !!g.final;

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
          if (final && g.picked) {
            verdict = g.correct ? "✅ Helyes tipp" : "❌ Hibás tipp";
          }

          return (
            <div key={g.id} className="scheduleRow">
              <div
                className="scheduleRowBar"
                style={{ background: "rgba(60,130,255,.65)" }}
              />

              <div
                className="scheduleRowMain"
                style={{ gridTemplateColumns: "1fr", gap: 10 }}
              >
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
                    title={
                      !g.canPick
                        ? "Kickoff után nem módosítható"
                        : "Válaszd a győztest"
                    }
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <TeamLogo team={g.awayTeam} size={22} />
                      <span style={{ fontWeight: 900 }}>{g.awayTeam}</span>
                    </span>
                    <span style={{ fontWeight: 900 }}>{leftScore}</span>
                  </button>

                  <div className="pickMeta muted" style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 900 }}>
                      {final ? "FINAL" : formatKickoff(g.kickoffAt)}
                    </div>
                    <div style={{ opacity: 0.9 }}>
                      {g.canPick ? (isSaving ? "Saving..." : "Open") : "Locked"}
                    </div>
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
                    title={
                      !g.canPick
                        ? "Kickoff után nem módosítható"
                        : "Válaszd a győztest"
                    }
                  >
                    <span style={{ fontWeight: 900 }}>{rightScore}</span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span style={{ fontWeight: 900 }}>{g.homeTeam}</span>
                      <TeamLogo team={g.homeTeam} size={22} />
                    </span>
                  </button>
                </div>

                {verdict && (
                  <div style={{ fontWeight: 900, fontSize: 13 }}>{verdict}</div>
                )}
              </div>
            </div>
          );
        })}

        {!loadingGames && !games.length && !err && (
          <div className="card" style={{ padding: 14 }}>
            <div className="muted">Ehhez a héthez nincs schedule adat.</div>
          </div>
        )}
      </div>
    </div>
  );
}