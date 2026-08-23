import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link, useSearchParams } from "react-router-dom";
import WeekDropdown from "../components/WeekDropdown";
import { useLanguage } from "../i18n/LanguageContext";

const SEASON = 2026;

function formatScore(value) {
  return Number(value || 0).toFixed(1);
}

const userLinkStyle = {
  color: "inherit",
  textDecoration: "none",
  fontWeight: 800,
};

export default function PerfectChallengeLeaderboard() {
  const { t, language } = useLanguage();
  const [sp, setSp] = useSearchParams();
  const initialWeek = Number(sp.get("week") || 1);

  const [week, setWeek] = useState(initialWeek);
  const [weeks, setWeeks] = useState([]);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  async function loadWeeks() {
    const res = await api.get("/perfect-challenge/weeks");
    const ws = Array.isArray(res.data?.weeks) ? res.data.weeks : [];

    setWeeks(ws);

    if (!ws.length) return;

    const safeWeek = ws.includes(initialWeek) ? initialWeek : ws[0];
    setWeek(safeWeek);
  }

  async function loadLeaderboard(targetWeek) {
    setErr("");

    try {
      const res = await api.get("/perfect-challenge/leaderboard", {
        params: { season: SEASON, week: targetWeek },
      });

      setData(res.data);
    } catch (e) {
      setData(null);
      setErr(
        e?.response?.data?.error ||
          e?.message ||
          t("perfectChallengeLeaderboard.loadError")
      );
    }
  }

  useEffect(() => {
    loadWeeks().catch(() => setErr(t("perfectChallengeLeaderboard.loadWeeksError")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!week) return;

    const currentQueryWeek = Number(sp.get("week") || 0);
    if (currentQueryWeek !== week) {
      setSp({ week: String(week) }, { replace: true });
    }

    loadLeaderboard(week).catch(() =>
      setErr(t("perfectChallengeLeaderboard.loadError"))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);

  const weekly = data?.weekly || [];
  const totals = data?.totals || [];

  const weekTitle = useMemo(
    () =>
      `${t("perfectChallengeLeaderboard.titlePrefix")} · ${
        language === "hu" ? `${week}. hét` : `Week ${week}`
      }`,
    [week, t, language]
  );

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">FANTASY</span>
          <span>Leaderboard</span>
        </div>

        <h1 className="h1">{weekTitle}</h1>

        <p className="sub">{t("perfectChallengeLeaderboard.subtitle")}</p>

        <div className="filters-bar" style={{ marginTop: 14 }}>
          <WeekDropdown
            value={week}
            options={weeks}
            onChange={setWeek}
            label={t("perfectChallengeLeaderboard.weekLabel")}
            width={170}
            formatWeek={(w) => (language === "hu" ? `${w}. hét` : `Week ${w}`)}
          />

          <div className="filters-spacer" />

          <Link to={`/fantasy/perfect-challenge?week=${week}`} className="btn">
            {t("perfectChallengeLeaderboard.backToPerfectChallenge")}
          </Link>
        </div>
      </div>

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      <div className="card" style={{ marginTop: 14, padding: 16 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>{t("perfectChallengeLeaderboard.weeklyTableTitle")}</h3>

        <table className="table">
          <colgroup>
            <col style={{ width: 60 }} />
            <col />
            <col style={{ width: 140 }} />
          </colgroup>
          <thead>
            <tr>
              <th>{t("perfectChallengeLeaderboard.colRank")}</th>
              <th>{t("perfectChallengeLeaderboard.colUser")}</th>
              <th>{t("perfectChallengeLeaderboard.colPoints")}</th>
            </tr>
          </thead>

          <tbody>
            {weekly.map((row, idx) => (
              <tr key={row.user.id}>
                <td>{idx + 1}</td>
                <td>
                  <Link
                    to={`/fantasy/perfect-challenge?week=${week}&userId=${row.user.id}`}
                    style={userLinkStyle}
                  >
                    {row.user.username}
                  </Link>
                </td>
                <td>{formatScore(row.points)}</td>
              </tr>
            ))}

            {!weekly.length && (
              <tr>
                <td colSpan="3" className="muted">
                  {t("perfectChallengeLeaderboard.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <h3 style={{ marginTop: 24, marginBottom: 12 }}>{t("perfectChallengeLeaderboard.seasonTableTitle")}</h3>

        <table className="table">
          <colgroup>
            <col style={{ width: 60 }} />
            <col />
            <col style={{ width: 140 }} />
          </colgroup>
          <thead>
            <tr>
              <th>{t("perfectChallengeLeaderboard.colRank")}</th>
              <th>{t("perfectChallengeLeaderboard.colUser")}</th>
              <th>{t("perfectChallengeLeaderboard.colTotalPoints")}</th>
            </tr>
          </thead>

          <tbody>
            {totals.map((row, idx) => (
              <tr key={row.userId}>
                <td>{idx + 1}</td>
                <td>
                  <Link
                    to={`/fantasy/perfect-challenge?week=${week}&userId=${row.userId}`}
                    style={userLinkStyle}
                  >
                    {row.username}
                  </Link>
                </td>
                <td>{formatScore(row.points)}</td>
              </tr>
            ))}

            {!totals.length && (
              <tr>
                <td colSpan="3" className="muted">
                  {t("perfectChallengeLeaderboard.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}