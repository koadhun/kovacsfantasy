import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

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
  const navigate = useNavigate();

  const week = Number(sp.get("week") || 1);

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    const res = await api.get(`/pickem/user/${userId}/picks`, {
      params: { season: SEASON, week },
    });
    setData(res.data);
  }

  useEffect(() => {
    load().catch((e) => {
      setErr(e?.response?.data?.error || "Nem sikerült betölteni a user pickeket.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, week]);

  const picks = data?.picks || [];
  const username = data?.user?.username || "Unknown";

  const visiblePickCount = useMemo(
    () => picks.filter((g) => g.started && g.picked).length,
    [picks]
  );

  function goMyPicks() {
    navigate(`/fantasy/weekly-pickem?week=${week}`);
  }

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">FANTASY</span>
          <span>User Picks</span>
        </div>

        <h1 className="h1">User Picks · Week {week}</h1>
        <p className="sub">
          Kickoff előtt a választás rejtve marad. Kickoff után látható.
        </p>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <span className="pill">
            <span className="dot" />
            Viewing: <strong style={{ color: "var(--text)" }}>{username}</strong>
          </span>

          <span className="pill">
            <span className="dot" />
            {visiblePickCount}/{picks.filter((g) => g.started).length} visible picks
          </span>

          <div className="filters-spacer" />

          <button className="btn" onClick={goMyPicks}>
            My picks
          </button>

          <Link to={`/fantasy/weekly-pickem/leaderboard?week=${week}`} className="btn primary">
            Back to leaderboard
          </Link>
        </div>
      </div>

      {err && <p className="error" style={{ marginTop: 14 }}>{err}</p>}

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {picks.map((g) => {
          const final = g.status === "FINAL" && g.homeScore != null && g.awayScore != null;

          // A te preferált “LAR 17 | FINAL | 24 DET” szerkezet:
          // bal: AWAY TEAM + score
          // közép: FINAL vagy kickoff
          // jobb: HOME score + TEAM
          const leftScore = final ? g.awayScore : "—";
          const rightScore = final ? g.homeScore : "—";

          // pick megjelenítés:
          // - ha még nem started: nincs highlight, “Pick hidden”
          // - ha started és van picked: azt a csapatot emeljük ki
          const leftSelected = g.started && g.picked && g.picked === g.awayTeam;
          const rightSelected = g.started && g.picked && g.picked === g.homeTeam;

          return (
            <div key={g.gameId} className="scheduleRow">
              <div className="scheduleRowBar" style={{ background: "rgba(60,130,255,.65)" }} />

              <div className="scheduleRowMain" style={{ gridTemplateColumns: "1fr .6fr 1fr", gap: 12 }}>
                {/* LEFT */}
                <div className={`pickTeamBtn ${leftSelected ? "selected" : ""}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "default" }}>
                  <span style={{ fontWeight: 900 }}>{g.awayTeam}</span>
                  <span style={{ fontWeight: 900 }}>{leftScore}</span>
                </div>

                {/* MIDDLE */}
                <div style={{ display: "grid", justifyItems: "center", alignContent: "center", gap: 6 }}>
                  <div className={`statusPill ${final ? "final" : "scheduled"}`}>
                    {final ? "FINAL" : formatKickoff(g.kickoffAt)}
                  </div>

                  <div className="muted" style={{ fontSize: 12 }}>
                    {!g.started ? "Pick hidden" : (g.picked ? `Picked: ${g.picked}` : "No pick")}
                  </div>
                </div>

                {/* RIGHT */}
                <div className={`pickTeamBtn ${rightSelected ? "selected" : ""}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "default" }}>
                  <span style={{ fontWeight: 900 }}>{rightScore}</span>
                  <span style={{ fontWeight: 900 }}>{g.homeTeam}</span>
                </div>
              </div>
            </div>
          );
        })}

        {!picks.length && !err && (
          <div className="card" style={{ padding: 14 }}>
            <div className="muted">Ehhez a héthez nincs adat.</div>
          </div>
        )}
      </div>
    </div>
  );
}