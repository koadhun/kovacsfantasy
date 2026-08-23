import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import TeamLogo from "../components/TeamLogo";
import { useLanguage } from "../i18n/LanguageContext";

const SEASON = 2026;

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
  const { t } = useLanguage();
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
          t("pickem.loadPicksError")
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
          <span className="tag">{t("pickem.userPicksBadge")}</span>
          <span>{t("pickem.userPicksHeading")}</span>
        </div>

        <h1 className="h1">{t("pickem.userPicksTitlePrefix")} · {t("pickem.weekWord")} {week}</h1>

        <p className="sub">{t("pickem.userPicksSubtitle")}</p>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <span className="pill">
            <span className="dot" />
            {t("pickem.viewing")}
            <b style={{ marginLeft: 6 }}>{username}</b>
            <span style={{ marginLeft: 10 }}>
              {visiblePickCount}/{startedCount} {t("pickem.visiblePicksSuffix")}
            </span>
          </span>

          <div className="filters-spacer" />

          <button className="btn" onClick={goMyPicks}>
            {t("pickem.myPicks")}
          </button>

          <Link
            className="btn primary"
            to={`/fantasy/weekly-pickem/leaderboard?week=${week}`}
          >
            {t("pickem.backToLeaderboard")}
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
          {t("pickem.loadingLabel")}
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
          verdict = g.correct ? t("pickem.correctPick") : t("pickem.wrongPick");
        } else if (started && g.picked && !final) {
          verdict = t("pickem.pickRevealed");
        } else if (!started) {
          verdict = t("pickem.pickHidden");
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
                  {!started ? t("pickem.pickHidden") : g.picked ? `${t("pickem.pickedLabel")} ${g.picked}` : t("pickem.noPick")}
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
          {t("pickem.noDataForWeek")}
        </p>
      )}
    </div>
  );
}