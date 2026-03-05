import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api } from "../api";

const SEASON = 2025;

function formatKickoff(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${day} ${time}`;
}

export default function PickEmUserPicks() {
  const { userId } = useParams();
  const [sp] = useSearchParams();
  const week = Number(sp.get("week") || 1);

  const [targetUser, setTargetUser] = useState(null);

  const [games, setGames] = useState([]);
  const [pickMap, setPickMap] = useState({}); // gameId -> pickedTeam
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr("");
    setLoading(true);

    // 1) full schedule for the week (shows all games)
    const scheduleRes = await api.get("/schedule/by-week", { params: { season: SEASON, week } });
    const scheduleGames = scheduleRes.data?.games || [];

    // 2) picks for the given user (anti-cheat: only started games)
    const picksRes = await api.get(`/pickem/user/${userId}/picks`, { params: { season: SEASON, week } });
    const user = picksRes.data?.user || null;
    const picks = picksRes.data?.picks || [];

    const map = Object.fromEntries(picks.map((p) => [p.gameId, p.picked]));
    setTargetUser(user);
    setPickMap(map);
    setGames(scheduleGames);
    setLoading(false);
  }

  useEffect(() => {
    load().catch((e) => {
      setErr(e?.response?.data?.error || "Nem sikerült betölteni a user pickeket.");
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, week]);

  const pickedVisibleCount = useMemo(() => {
    return Object.values(pickMap).filter(Boolean).length;
  }, [pickMap]);

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">FANTASY</span>
          <span>User Picks</span>
        </div>

        <h1 className="h1">User Picks · Week {week}</h1>
        <p className="sub">
          Csak a már elkezdődött meccsek tippei láthatók. A jövőbeli meccseknél a választás rejtve marad.
        </p>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <span className="pill">
            <span className="dot" />
            Viewing: <b style={{ color: "var(--text)" }}>{targetUser?.username || "—"}</b>
          </span>

          <span className="pill">
            <span className="dot" />
            {pickedVisibleCount} visible picks
          </span>

          <div className="filters-spacer" />

          <Link to={`/fantasy/weekly-pickem/leaderboard?week=${week}`} className="btn primary">
            Back to leaderboard
          </Link>
        </div>
      </div>

      {err && <p className="error" style={{ marginTop: 14 }}>{err}</p>}

      {loading ? (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="muted">Betöltés...</div>
        </div>
      ) : (
        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          {games.map((g) => {
            const final = g.status === "FINAL" && g.homeScore != null && g.awayScore != null;

            // only started games have picks in the map (anti-cheat)
            const picked = pickMap[g.id] || null;

            // winner calc (optional highlight)
            let winner = null;
            if (final) {
              if (g.homeScore > g.awayScore) winner = g.homeTeam;
              else if (g.awayScore > g.homeScore) winner = g.awayTeam;
              else winner = "TIE";
            }

            const leftTeam = g.awayTeam;
            const rightTeam = g.homeTeam;
            const leftScore = final ? g.awayScore : "—";
            const rightScore = final ? g.homeScore : "—";

            // highlight only if we actually know their pick (started game)
            const leftSelected = picked && picked === leftTeam;
            const rightSelected = picked && picked === rightTeam;

            const leftWinner = final && winner && winner !== "TIE" && winner === leftTeam;
            const rightWinner = final && winner && winner !== "TIE" && winner === rightTeam;

            return (
              <div key={g.id} className="scheduleRow">
                <div className="scheduleRowBar" style={{ background: "rgba(60,130,255,.65)" }} />

                <div className="scheduleRowMain" style={{ gridTemplateColumns: "1fr .45fr 1fr", alignItems: "center" }}>
                  {/* LEFT */}
                  <div
                    className={`pickTeamBtn ${leftSelected ? "selected" : ""}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      alignItems: "center",
                      padding: "12px 14px",
                      height: "auto",
                      cursor: "default",
                      ...(leftWinner ? { background: "rgba(60,130,255,.10)", borderColor: "rgba(60,130,255,.28)" } : null),
                    }}
                    title={picked ? `Picked: ${picked}` : "Pick rejtve (még nem kezdődött el a meccs)"}
                  >
                    <span style={{ fontWeight: 900, letterSpacing: ".4px" }}>{leftTeam}</span>
                    <span style={{ fontWeight: 900, opacity: final ? 1 : 0.6 }}>{leftScore}</span>
                  </div>

                  {/* MIDDLE */}
                  <div style={{ display: "grid", justifyItems: "center", gap: 6 }}>
                    <div className={`statusPill ${final ? "final" : "scheduled"}`}>
                      {final ? "FINAL" : formatKickoff(g.kickoffAt)}
                    </div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {picked ? `Picked: ${picked}` : "Pick hidden"}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div
                    className={`pickTeamBtn ${rightSelected ? "selected" : ""}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      alignItems: "center",
                      padding: "12px 14px",
                      height: "auto",
                      cursor: "default",
                      ...(rightWinner ? { background: "rgba(60,130,255,.10)", borderColor: "rgba(60,130,255,.28)" } : null),
                    }}
                    title={picked ? `Picked: ${picked}` : "Pick rejtve (még nem kezdődött el a meccs)"}
                  >
                    <span style={{ fontWeight: 900, opacity: final ? 1 : 0.6 }}>{rightScore}</span>
                    <span style={{ fontWeight: 900, letterSpacing: ".4px", justifySelf: "end" }}>{rightTeam}</span>
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
      )}
    </div>
  );
}