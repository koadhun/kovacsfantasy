import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link, useSearchParams } from "react-router-dom";
import WeekDropdown from "../components/WeekDropdown";
import { useLanguage } from "../i18n/LanguageContext";

const SEASON = 2026;

export default function PickEmLeaderboard() {
  const { t } = useLanguage();
  const [sp, setSp] = useSearchParams();

  const initialWeek = Number(sp.get("week") || 1);

  const [week, setWeek] = useState(initialWeek);
  const [weeks, setWeeks] = useState([]);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  async function loadWeeks() {
    const res = await api.get("/schedule/weeks", {
      params: { season: SEASON },
    });

    const ws = Array.isArray(res.data?.weeks) ? res.data.weeks : [];
    setWeeks(ws);

    if (!ws.length) return;

    const safeWeek = ws.includes(initialWeek) ? initialWeek : ws[0];
    setWeek(safeWeek);
  }

  async function loadLeaderboard(targetWeek) {
    setErr("");

    try {
      const res = await api.get("/pickem/leaderboard", {
        params: { season: SEASON, week: targetWeek },
      });
      setData(res.data);
    } catch (e) {
      setData(null);
      setErr(
        e?.response?.data?.error ||
          e?.message ||
          t("pickem.loadPicksError")
      );
    }
  }

  useEffect(() => {
    loadWeeks().catch(() => setErr(t("pickem.loadWeeksError")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!week) return;

    const currentQueryWeek = Number(sp.get("week") || 0);
    if (currentQueryWeek !== week) {
      setSp({ week: String(week) }, { replace: true });
    }

    loadLeaderboard(week).catch(() =>
      setErr(t("pickem.loadPicksError"))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);

  const weekly = data?.weekly || [];
  const totals = data?.totals || [];

  const weekTitle = useMemo(
    () => `${t("pickem.leaderboardTitlePrefix")} · ${t("pickem.weekWord")} ${week}`,
    [week, t]
  );

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">{t("pickem.leaderboardBadge")}</span>
          <span>{t("pickem.leaderboardHeading")}</span>
        </div>

        <h1 className="h1">{weekTitle}</h1>

        <p className="sub">{t("pickem.leaderboardSubtitle")}</p>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <WeekDropdown
            value={week}
            options={weeks}
            onChange={setWeek}
            label={t("pickem.weekLabel")}
            width={170}
          />

          <div className="filters-spacer" />

          <Link to={`/fantasy/weekly-pickem?week=${week}`} className="btn">
            {t("pickem.backToPicks")}
          </Link>
        </div>
      </div>

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      <div className="card" style={{ marginTop: 14, padding: 16 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>{t("pickem.weeklyTableTitle")}</h3>

        <table className="table">
          <thead>
            <tr>
              <th>{t("pickem.colRank")}</th>
              <th>{t("pickem.colUser")}</th>
              <th>{t("pickem.colPoints")}</th>
              <th>{t("pickem.colCorrect")}</th>
            </tr>
          </thead>
          <tbody>
            {weekly.map((r, idx) => (
              <tr key={r.user.id}>
                <td>{idx + 1}</td>
                <td>
                  <Link
                    to={`/fantasy/weekly-pickem/user/${r.user.id}?week=${week}`}
                  >
                    {r.user.username}
                  </Link>
                </td>
                <td>{r.points}</td>
                <td>{r.correct}</td>
              </tr>
            ))}

            {!weekly.length && (
              <tr>
                <td colSpan="4" className="muted">
                  {t("pickem.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <h3 style={{ marginTop: 24, marginBottom: 12 }}>{t("pickem.seasonTableTitle")}</h3>

        <table className="table">
          <thead>
            <tr>
              <th>{t("pickem.colRank")}</th>
              <th>{t("pickem.colUser")}</th>
              <th>{t("pickem.colTotalPoints")}</th>
            </tr>
          </thead>
          <tbody>
            {totals.map((r, idx) => (
              <tr key={r.userId}>
                <td>{idx + 1}</td>
                <td>{r.username}</td>
                <td>{r.points}</td>
              </tr>
            ))}

            {!totals.length && (
              <tr>
                <td colSpan="3" className="muted">
                  {t("pickem.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}