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
      setErr(
        e?.response?.data?.error ||
          "Nem sikerült betölteni a user pickeket."
      )
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
            Viewing:
            <b style={{ marginLeft: 6 }}>{username}</b>
            <span style={{ marginLeft: 10 }}>
              {visiblePickCount}/{startedCount} visible picks
            </span>
          </span>

          <div className="filters-spacer" />

          <button className="btn" onClick={goMyPicks}>
            My picks
          </button>

          <Link
            className="btn primary"
            to={`/fantasy/weekly-pickem/leaderboard?week=${week}`}
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

      {picks.map((g) => {
        const key = g.id || g.gameId;
        const final =
          g.final ??
          (g.status === "FINAL" && g.homeScore != null && g.awayScore != null);

        const started = Boolean(g.started || final);
        const leftScore = final ? g.awayScore : "—";
        const rightScore = final ? g.homeScore : "—";

        const leftSelected = started && g.picked && g.picked === g.awayTeam;
        const rightSelected = started && g.picked && g.picked === g.homeTeam;

        function borderColorForSelected() {
          if (!started) return null;
          if (!g.picked) return null;
          if (!final) return "rgba(245,158,11,.65)";
          return g.correct ? "rgba(34,197,94,.55)" : "rgba(225,29,72,.60)";
        }

        const borderColor = borderColorForSelected();

        let verdict = null;
        if (started && g.picked && final) {
          verdict = g.correct ? "✅ Helyes tipp" : "❌ Hibás tipp";
        } else if (started && g.picked && !final) {
          verdict = "Pick revealed";
        } else if (!started) {
          verdict = "Pick hidden";
        }

        return (
          <div
            key={key}
            className="card"
            style={{
              marginTop: 14,
              padding: 16,
              borderLeft: borderColor ? `4px solid ${borderColor}` : undefined,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 16,
                  border: leftSelected
                    ? `1px solid ${borderColor || "rgba(59,130,246,.4)"}`
                    : "1px solid rgba(255,255,255,.08)",
                  background: leftSelected
                    ? "rgba(59,130,246,.10)"
                    : "rgba(255,255,255,.02)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <TeamLogo team={g.awayTeam} size={20} />
                  <strong>{g.awayTeam}</strong>
                </div>
                <strong style={{ fontSize: 18 }}>{leftScore}</strong>
              </div>

              <div style={{ textAlign: "center" }}>
                <div className="muted" style={{ fontWeight: 800 }}>
                  {final ? "FINAL" : formatKickoff(g.kickoffAt)}
                </div>
                <div className="muted" style={{ marginTop: 4 }}>
                  {!started ? "Pick hidden" : g.picked ? `Picked: ${g.picked}` : "No pick"}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 16,
                  border: rightSelected
                    ? `1px solid ${borderColor || "rgba(59,130,246,.4)"}`
                    : "1px solid rgba(255,255,255,.08)",
                  background: rightSelected
                    ? "rgba(59,130,246,.10)"
                    : "rgba(255,255,255,.02)",
                }}
              >
                <strong style={{ fontSize: 18 }}>{rightScore}</strong>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <strong>{g.homeTeam}</strong>
                  <TeamLogo team={g.homeTeam} size={20} />
                </div>
              </div>
            </div>

            {verdict && (
              <div style={{ marginTop: 10, fontWeight: 700 }}>
                {verdict}
              </div>
            )}
          </div>
        );
      })}

      {!loading && !picks.length && !err && (
        <p className="muted" style={{ marginTop: 14 }}>
          Ehhez a héthez nincs adat.
        </p>
      )}
    </div>
  );
}