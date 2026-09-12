import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useLanguage } from "../i18n/LanguageContext";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

function formatScore(value) {
  return Number(value || 0).toFixed(1);
}

export default function HallOfFame() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setErr("");
    api
      .get("/hall-of-fame")
      .then((res) => setEntries(res.data.entries || []))
      .catch(() => setErr(t("hallOfFame.loadError")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gameLabels = {
    WEEKLY_PICKEM: t("hallOfFame.weeklyPickem"),
    PERFECT_CHALLENGE: t("hallOfFame.perfectChallenge"),
    PLAYOFF_CHALLENGE: t("hallOfFame.playoffChallenge"),
  };

  const grouped = useMemo(() => {
    const bySeason = {};
    for (const e of entries) {
      bySeason[e.season] ||= {};
      bySeason[e.season][e.game] ||= [];
      bySeason[e.season][e.game].push(e);
    }
    return Object.entries(bySeason)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([season, games]) => ({
        season,
        games: Object.entries(games).map(([game, rows]) => ({
          game,
          rows: rows.sort((a, b) => a.rank - b.rank),
        })),
      }));
  }, [entries]);

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">{t("hallOfFame.badge")}</span>
          <span>{t("hallOfFame.kicker")}</span>
        </div>
        <h1 className="h1">{t("hallOfFame.title")}</h1>
        <p className="sub">{t("hallOfFame.subtitle")}</p>
      </div>

      {loading && <p className="muted" style={{ marginTop: 14 }}>{t("hallOfFame.loading")}</p>}
      {err && <p className="error" style={{ marginTop: 14 }}>{err}</p>}

      {!loading && !err && !grouped.length && (
        <div className="card" style={{ marginTop: 14, padding: 14 }}>
          <div className="muted">{t("hallOfFame.noData")}</div>
        </div>
      )}

      <div style={{ marginTop: 18, display: "grid", gap: 22 }}>
        {grouped.map(({ season, games }) => (
          <div key={season}>
            <h2 style={{ fontSize: 22, marginBottom: 12 }}>{season}</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 14,
              }}
            >
              {games.map(({ game, rows }) => (
                <div key={game} className="card" style={{ padding: 16 }}>
                  <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>
                    {gameLabels[game] || game}
                  </h3>

                  <div style={{ display: "grid", gap: 8 }}>
                    {rows.map((row) => (
                      <div
                        key={row.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: 10,
                          background: "rgba(255,255,255,.03)",
                          border: "1px solid rgba(255,255,255,.06)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{MEDALS[row.rank] || row.rank}</span>
                          <span style={{ fontWeight: 800 }}>{row.username}</span>
                        </div>
                        <span className="muted" style={{ fontWeight: 700 }}>
                          {formatScore(row.points)} {t("hallOfFame.pts")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}