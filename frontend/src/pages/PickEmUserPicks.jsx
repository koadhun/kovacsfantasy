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

function isFinal(g) {
  return g.status === "FINAL" && g.homeScore != null && g.awayScore != null;
}

function winnerTeam(g) {
  if (!isFinal(g)) return null;
  if (g.homeScore === g.awayScore) return null; // tie (ritka NFL-ben, de lehet)
  return g.homeScore > g.awayScore ? g.homeTeam : g.awayTeam;
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

  const visiblePickCount = useMemo(() => {
    // “látható pick”: csak started után mutatjuk (a backend logikád szerint)
    return picks.filter((g) => g.started && g.picked).length;
  }, [picks]);

  const startedCount = useMemo(() => picks.filter((g) => g.started).length, [picks]);

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
          Csak a már elkezdődött meccseknél látható a másik user választása. A jövőbeli meccseknél rejtve marad.
        </p>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <span className="pill">
            <span className="dot" />
            Viewing: <b style={{ marginLeft: 6 }}>{username}</b>
          </span>

          <span className="pill">
            <span className="dot" />
            {visiblePickCount}/{startedCount} visible picks
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

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {picks.map((g) => {
          const final = isFinal(g);

          // NFL-szerű sor: AWAY + score | MIDDLE (FINAL/kickoff) | score + HOME
          const leftScore = final ? g.awayScore : "—";
          const rightScore = final ? g.homeScore : "—";

          // szabály: ha még nem started => pick rejtve (még akkor is, ha a DB-ben van)
          const canRevealPick = !!g.started;

          const awayPicked = canRevealPick && g.picked && g.picked === g.awayTeam;
          const homePicked = canRevealPick && g.picked && g.picked === g.homeTeam;

          // színezés:
          // - started && !final: arany (pending / in progress)
          // - final: green ha correct, red ha wrong
          const w = winnerTeam(g);
          const correct = final && canRevealPick && g.picked && w ? g.picked === w : null;

          const awayClasses = ["pickTeamBtn"];
          const homeClasses = ["pickTeamBtn"];

          if (awayPicked) awayClasses.push("selected");
          if (homePicked) homeClasses.push("selected");

          // csak akkor színezzük, ha a pick látható
          if (canRevealPick && g.picked) {
            if (!final) {
              // IN PROGRESS / STARTED
              if (awayPicked) awayClasses.push("pending");
              if (homePicked) homeClasses.push("pending");
            } else if (correct === true) {
              if (awayPicked) awayClasses.push("good");
              if (homePicked) homeClasses.push("good");
            } else if (correct === false) {
              if (awayPicked) awayClasses.push("bad");
              if (homePicked) homeClasses.push("bad");
            }
          }

          return (
            <div key={g.id} className="scheduleRow">
              <div className="scheduleRowBar" style={{ background: "rgba(60,130,255,.65)" }} />

              <div className="scheduleRowMain" style={{ gridTemplateColumns: "1fr .4fr 1fr", gap: 14 }}>
                {/* LEFT: away */}
                <button className={awayClasses.join(" ")} disabled>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span>{g.awayTeam}</span>
                    <span style={{ fontWeight: 900 }}>{leftScore}</span>
                  </div>
                </button>

                {/* MIDDLE */}
                <div style={{ display: "grid", justifyItems: "center", alignContent: "center", gap: 6 }}>
                  <div className={`statusPill ${final ? "final" : "scheduled"}`}>
                    {final ? "FINAL" : formatKickoff(g.kickoffAt)}
                  </div>

                  <div className="muted" style={{ fontSize: 12, textAlign: "center" }}>
                    {!canRevealPick
                      ? "Pick hidden"
                      : g.picked
                        ? final
                          ? (correct === true ? "✅ Correct" : correct === false ? "❌ Wrong" : "Tie")
                          : "IN PROGRESS / STARTED"
                        : "No pick"}
                  </div>
                </div>

                {/* RIGHT: home */}
                <button className={homeClasses.join(" ")} disabled>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontWeight: 900 }}>{rightScore}</span>
                    <span>{g.homeTeam}</span>
                  </div>
                </button>
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