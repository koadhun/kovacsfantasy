import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import SimpleDropdown from "../components/SimpleDropdown";
import { useLanguage } from "../i18n/LanguageContext";

const SEASON = 2025;

const userLinkStyle = {
  color: "inherit",
  textDecoration: "none",
  fontWeight: 800,
};

function formatScore(value) {
  return Number(value || 0).toFixed(1);
}

export default function PlayoffChallengeLeaderboard() {
  const { t } = useLanguage();
  const [sp, setSp] = useSearchParams();
  const initialRound = String(sp.get("round") || "WILDCARD");

  const [round, setRound] = useState(initialRound);
  const [rounds, setRounds] = useState([]);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  async function loadRounds() {
    const res = await api.get("/playoff-challenge/rounds");
    const items = Array.isArray(res.data?.rounds) ? res.data.rounds : [];

    setRounds(items);

    if (!items.length) return;

    const safeRound = items.some((item) => item.value === initialRound)
      ? initialRound
      : items[0].value;

    setRound(safeRound);
  }

  async function loadLeaderboard(targetRound) {
    setErr("");

    try {
      const res = await api.get("/playoff-challenge/leaderboard", {
        params: { season: SEASON, round: targetRound },
      });
      setData(res.data);
    } catch (e) {
      setData(null);
      setErr(
        e?.response?.data?.error ||
          e?.message ||
          t("playoffChallengeLeaderboard.loadError")
      );
    }
  }

  useEffect(() => {
    loadRounds().catch(() =>
      setErr(t("playoffChallengeLeaderboard.loadRoundsError"))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!round) return;

    const currentQueryRound = String(sp.get("round") || "");
    if (currentQueryRound !== round) {
      setSp({ round }, { replace: true });
    }

    loadLeaderboard(round).catch(() =>
      setErr(t("playoffChallengeLeaderboard.loadError"))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const roundRows = data?.roundRows || [];
  const totals = data?.totals || [];
  const roundLabel = data?.roundLabel || round;

  const title = useMemo(
    () => `${t("playoffChallengeLeaderboard.titlePrefix")} · ${roundLabel}`,
    [roundLabel, t]
  );

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">FANTASY</span>
          <span>Leaderboard</span>
        </div>

        <h1 className="h1">{title}</h1>

        <p className="sub" style={{ maxWidth: 920 }}>
          {t("playoffChallengeLeaderboard.subtitle")}
        </p>

        <div className="filters-bar" style={{ marginTop: 16 }}>
          <SimpleDropdown
            value={round}
            options={rounds}
            onChange={setRound}
            label={t("playoffChallengeLeaderboard.roundLabel")}
            width={200}
          />

          <div className="filters-spacer" />

          <Link to={`/fantasy/playoff-challenge?round=${round}`} className="btn primary">
            {t("playoffChallengeLeaderboard.backToPlayoffChallenge")}
          </Link>
        </div>
      </div>

      {err ? (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      ) : null}

      <div className="grid" style={{ marginTop: 18 }}>
        <div className="col-12 card">
          <h3 className="card-title">{t("playoffChallengeLeaderboard.roundStandingsTitle")}</h3>
          <div className="muted" style={{ marginBottom: 12 }}>
            {roundLabel} · {t("playoffChallengeLeaderboard.roundStandingsSubtitle")}
          </div>

          <div className="table-wrap">
            <table className="table">
              <colgroup>
                <col style={{ width: 60 }} />
                <col />
                <col style={{ width: 140 }} />
              </colgroup>
              <thead>
                <tr>
                  <th>{t("playoffChallengeLeaderboard.colRank")}</th>
                  <th>{t("playoffChallengeLeaderboard.colUser")}</th>
                  <th>{t("playoffChallengeLeaderboard.colRoundPoints")}</th>
                </tr>
              </thead>
              <tbody>
                {roundRows.map((row, idx) => (
                  <tr key={row.user.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <Link
                        to={`/fantasy/playoff-challenge?round=${round}&userId=${row.user.id}`}
                        style={userLinkStyle}
                      >
                        {row.user.username}
                      </Link>
                    </td>
                    <td>{formatScore(row.points)}</td>
                  </tr>
                ))}

                {!roundRows.length && (
                  <tr>
                    <td colSpan="3" className="muted">
                      {t("playoffChallengeLeaderboard.noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-12 card">
          <h3 className="card-title">{t("playoffChallengeLeaderboard.playoffTotalTitle")}</h3>
          <div className="muted" style={{ marginBottom: 12 }}>
            {t("playoffChallengeLeaderboard.playoffTotalSubtitle")}
          </div>

          <div className="table-wrap">
            <table className="table">
              <colgroup>
                <col style={{ width: 60 }} />
                <col />
                <col style={{ width: 140 }} />
              </colgroup>
              <thead>
                <tr>
                  <th>{t("playoffChallengeLeaderboard.colRank")}</th>
                  <th>{t("playoffChallengeLeaderboard.colUser")}</th>
                  <th>{t("playoffChallengeLeaderboard.colTotalPoints")}</th>
                </tr>
              </thead>
              <tbody>
                {totals.map((row, idx) => (
                  <tr key={row.userId}>
                    <td>{idx + 1}</td>
                    <td>
                      <Link
                        to={`/fantasy/playoff-challenge?round=${round}&userId=${row.userId}`}
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
                      {t("playoffChallengeLeaderboard.noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}