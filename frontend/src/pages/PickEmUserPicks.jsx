import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import TeamLogo from "../components/TeamLogo";

const SEASON = 2025;

function formatKickoff(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} ${time}`;
}

export default function PickEmUserPicks() {
  const { userId } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const week = Number(sp.get("week") || 1);

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setErr("");
    setLoading(true);

    try {
      const res = await api.get(`/pickem/user/${userId}/picks`, {
        params: { season: SEASON, week },
      });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch((e) =>
      setErr(e?.response?.data?.error || "Nem sikerült betölteni a user pickeket.")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, week]);

  const picks = data?.picks || [];
  const username = data?.user?.username || "Unknown";

  const startedCount = useMemo(
    () => picks.filter((g) => g.started).length,
    [picks]
  );

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
            Viewing: <b style={{ marginLeft: 6 }}>{username}</b>
            <span className="muted" style={{ marginLeft: 10 }}>
              {visiblePickCount}/{startedCount} visible picks
            </span>
          </span>

          <div className="filters-spacer" />

          <button className="btn" onClick={goMyPicks}>
            My picks
          </button>

          <Link
            to={`/fantasy/weekly-pickem/leaderboard?week=${week}`}
            className="btn primary"
          >
            Back to leaderboard
          </Link>
        </div>
      </div>

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      {loading && !picks.length && !err && (
        <p className="muted" style={{ marginTop: 14 }}>
          Betöltés…
        </p>
      )}

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {picks.map((g) => {
          const key = g.id || g.gameId;

          const final =
            g.final ??
            (g.status === "FINAL" &&
              g.homeScore != null &&
              g.awayScore != null);

          const leftScore = final ? g.awayScore : "—";
          const rightScore = final ? g.homeScore : "—";

          const leftSelected =
            g.started && g.picked && g.picked === g.awayTeam;
          const rightSelected =
            g.started && g.picked && g.picked === g.homeTeam;

          function borderColorForSelected() {
            if (!g.started) return null;
            if (!g.picked) return null;
            if (!final) return "rgba(245,158,11,.65)";
            return g.correct ? "rgba(34,197,94,.55)" : "rgba(225,29,72,.60)";
          }

          const borderColor = borderColorForSelected();

          let verdict = null;
          if (g.started && g.picked && final) {
            verdict = g.correct ? "✅ Helyes tipp" : "❌ Hibás tipp";
          } else if (g.started && g.picked && !final) {
            verdict = "🟨 Pick revealed";
          } else if (!g.started) {
            verdict = "🔒 Pick hidden";
          }

          return (
            <div key={key} className="scheduleRow">
              <div
                className="scheduleRowBar"
                style={{ background: "rgba(60,130,255,.65)" }}
              />

              <div
                className="scheduleRowMain"
                style={{ gridTemplateColumns: "1fr", gap: 10 }}
              >
                <div className="pickRow">
                  <div
                    className="pickTeamBtn"
                    style={{
                      cursor: "default",
                      borderColor: leftSelected
                        ? borderColor
                        : "rgba(255,255,255,.14)",
                      boxShadow:
                        leftSelected && borderColor
                          ? `inset 0 0 0 1px ${borderColor}`
                          : undefined,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "0 14px",
                    }}
                    title={leftSelected ? `Picked: ${g.picked}` : ""}
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
                  </div>

                  <div className="pickMeta muted" style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 900 }}>
                      {final ? "FINAL" : formatKickoff(g.kickoffAt)}
                    </div>
                    <div style={{ opacity: 0.9 }}>
                      {!g.started
                        ? "Pick hidden"
                        : g.picked
                        ? `Picked: ${g.picked}`
                        : "No pick"}
                    </div>
                  </div>

                  <div
                    className="pickTeamBtn"
                    style={{
                      cursor: "default",
                      borderColor: rightSelected
                        ? borderColor
                        : "rgba(255,255,255,.14)",
                      boxShadow:
                        rightSelected && borderColor
                          ? `inset 0 0 0 1px ${borderColor}`
                          : undefined,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "0 14px",
                    }}
                    title={rightSelected ? `Picked: ${g.picked}` : ""}
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
                  </div>
                </div>

                {verdict && (
                  <div style={{ fontWeight: 900, fontSize: 13 }}>{verdict}</div>
                )}
              </div>
            </div>
          );
        })}

        {!loading && !picks.length && !err && (
          <div className="card" style={{ padding: 14 }}>
            <div className="muted">Ehhez a héthez nincs adat.</div>
          </div>
        )}
      </div>
    </div>
  );
}