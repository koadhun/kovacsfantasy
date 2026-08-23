import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import TeamLogo from "../components/TeamLogo";
import WeekDropdown from "../components/WeekDropdown";
import SimpleDropdown from "../components/SimpleDropdown";
import { useLanguage } from "../i18n/LanguageContext";

import { Link } from "react-router-dom";

import { useTheme } from "../theme/ThemeContext";
import { getThemeTokens } from "../theme/themeTokens";

const TEAM_NAMES = {
  ARI: "Arizona Cardinals",
  ATL: "Atlanta Falcons",
  BAL: "Baltimore Ravens",
  BUF: "Buffalo Bills",
  CAR: "Carolina Panthers",
  CHI: "Chicago Bears",
  CIN: "Cincinnati Bengals",
  CLE: "Cleveland Browns",
  DAL: "Dallas Cowboys",
  DEN: "Denver Broncos",
  DET: "Detroit Lions",
  GB: "Green Bay Packers",
  HOU: "Houston Texans",
  IND: "Indianapolis Colts",
  JAX: "Jacksonville Jaguars",
  KC: "Kansas City Chiefs",
  LV: "Las Vegas Raiders",
  LAC: "Los Angeles Chargers",
  LAR: "Los Angeles Rams",
  MIA: "Miami Dolphins",
  MIN: "Minnesota Vikings",
  NE: "New England Patriots",
  NO: "New Orleans Saints",
  NYG: "New York Giants",
  NYJ: "New York Jets",
  PHI: "Philadelphia Eagles",
  PIT: "Pittsburgh Steelers",
  SEA: "Seattle Seahawks",
  SF: "San Francisco 49ers",
  TB: "Tampa Bay Buccaneers",
  TEN: "Tennessee Titans",
  WAS: "Washington Commanders",
};

function teamName(team) {
  return TEAM_NAMES[String(team || "").toUpperCase()] || team || "-";
}

function formatDay(iso) {
  const d = new Date(iso);
  return d
    .toLocaleDateString(undefined, { month: "short", day: "numeric" })
    .toUpperCase();
}

function formatKickoff(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString(undefined, { weekday: "short" });
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} ${time}`;
}

function isFinal(game) {
  return (
    game.status === "FINAL" &&
    game.homeScore != null &&
    game.awayScore != null
  );
}

function isLive(game) {
  return game.status === "IN_PROGRESS";
}

function winnerSide(game) {
  if (!isFinal(game)) return null;
  if (game.homeScore === game.awayScore) return "TIE";
  return game.homeScore > game.awayScore ? "HOME" : "AWAY";
}

function TeamScoreRow({ team, score, highlighted = false, winner = false, tokens }) {
  return (
    <div
      className="pickTeamBtn"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        padding: "0 16px",
        minHeight: 58,
        borderColor: winner
          ? tokens.panelBorder
          : highlighted
          ? "rgba(59,130,246,.24)"
          : tokens.panelBorderSoft,
        background: winner
          ? tokens.winnerBg
          : highlighted
          ? tokens.highlightedBg
          : tokens.neutralRowBg,
        boxShadow: winner
          ? tokens.isLight
            ? "inset 3px 0 0 rgba(16,24,40,.14)"
            : "inset 3px 0 0 rgba(255,255,255,.18), inset 0 0 0 1px rgba(255,255,255,.035)"
          : undefined,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          minWidth: 0,
          flex: 1,
        }}
      >
        <TeamLogo team={team} size={22} />
        <span
          style={{
            fontWeight: winner ? 900 : 800,
            fontSize: 18,
            lineHeight: 1.15,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: tokens.textPrimary,
          }}
        >
          {teamName(team)}
        </span>
      </div>

      <div
        style={{
          fontWeight: 900,
          fontSize: winner ? 19 : 18,
          minWidth: 26,
          textAlign: "right",
          flexShrink: 0,
          color: tokens.textPrimary,
        }}
      >
        {score}
      </div>
    </div>
  );
}

export default function Schedule() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const tokens = getThemeTokens(theme);
  const [sp, setSp] = useSearchParams();

  const STAGE_OPTIONS = [
    { value: "PRE", label: t("schedule.stagePre") },
    { value: "REG", label: t("schedule.stageReg") },
    { value: "POST", label: t("schedule.stagePost") },
  ];

  const [seasons, setSeasons] = useState([]);
  const [season, setSeason] = useState(Number(sp.get("season")) || new Date().getFullYear());
  const [stage, setStage] = useState(sp.get("stage") || "REG");
  const [weeks, setWeeks] = useState([]);
  const [week, setWeek] = useState(Number(sp.get("week")) || 1);
  const [games, setGames] = useState([]);
  const [err, setErr] = useState("");
  const initialWeekParamRef = useRef(sp.get("week"));
  const autoWeekAppliedRef = useRef(false);

  useEffect(() => {
    setSp({ season: String(season), stage, week: String(week) }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season, stage, week]);

  async function loadSeasons() {
    const res = await api.get("/schedule/seasons");
    const ss = res.data.seasons || [];
    setSeasons(ss);
    if (ss.length && !ss.includes(season)) setSeason(ss[0]);
  }

  async function loadWeeks() {
    const res = await api.get("/schedule/weeks", {
      params: { season, stage },
    });
    const ws = res.data.weeks || [];
    setWeeks(ws);

    if (!ws.length) {
      setGames([]);
      return;
    }

    if (
      !autoWeekAppliedRef.current &&
      !initialWeekParamRef.current &&
      stage === "REG"
    ) {
      autoWeekAppliedRef.current = true;
      try {
        const currentRes = await api.get("/schedule/current-week", {
          params: { season, stage: "REG" },
        });
        const current = Number(currentRes.data?.week);
        setWeek(ws.includes(current) ? current : ws[0]);
        return;
      } catch {
        // eshet a normál ágra lent
      }
    }

    if (!ws.includes(week)) setWeek(ws[0]);
  }

  async function loadWeekGames(w) {
    setErr("");
    const res = await api.get("/schedule/by-week", {
      params: { season, week: w, stage },
    });
    setGames(res.data.games || []);
  }

  useEffect(() => {
    loadSeasons().catch(() => setErr(t("schedule.loadSeasonsError")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadWeeks().catch(() => setErr(t("schedule.loadWeeksError")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season, stage]);

  useEffect(() => {
    if (weeks.length) {
      loadWeekGames(week).catch(() => setErr(t("schedule.loadGamesError")));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week, season, stage, weeks]);

  const stageLabel = useMemo(
    () => STAGE_OPTIONS.find((s) => s.value === stage)?.label || stage,
    [stage, language]
  );

  const headerTitle = useMemo(
    () =>
      `${t("schedule.titlePrefix")} · ${season} · ${stageLabel}${
        weeks.length ? ` · ${language === "hu" ? `${week}. hét` : `Week ${week}`}` : ""
      }`,
    [season, stageLabel, week, weeks.length, t, language]
  );

  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">SCHEDULE</span>
          <span>{t("schedule.byWeek")}</span>
        </div>

        <h1 className="h1">{headerTitle}</h1>

        <p className="sub">
          {t("schedule.refreshNotice")} <a href="http://nfl.com">NFL</a>
        </p>

        <div className="filters-bar">
          <SimpleDropdown
            value={season}
            options={seasons.map((s) => ({ value: s, label: String(s) }))}
            onChange={setSeason}
            label={t("schedule.seasonLabel")}
            width={110}
          />

          <SimpleDropdown
            value={stage}
            options={STAGE_OPTIONS}
            onChange={setStage}
            label={t("schedule.stageLabel")}
            width={180}
          />

          {weeks.length > 0 && (
            <WeekDropdown
              value={week}
              options={weeks}
              onChange={setWeek}
              label={t("schedule.weekLabel")}
              width={170}
              formatWeek={(w) => (language === "hu" ? `${w}. hét` : `Week ${w}`)}
            />
          )}

          <div className="filters-spacer" />

          <span className="pill">
            <span className="dot" />
            {games.length} {t("schedule.gamesSuffix")}
          </span>
        </div>
      </div>

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        {games.map((g) => {
          const final = isFinal(g);
          const live = isLive(g);
          const win = winnerSide(g);

                    return (
            <div
              key={g.id}
              className="card"
              style={{
                padding: 14,
                background: tokens.panelBg,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) 180px",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    minWidth: 0,
                    paddingRight: 12,
                    borderRight: `1px solid ${tokens.panelBorderSoft}`,
                  }}
                >
                   <TeamScoreRow
                    team={g.awayTeam}
                    score={(final || live) ? g.awayScore : "—"}
                    highlighted={!final && !live}
                    winner={final && win === "AWAY"}
                    tokens={tokens}
                  />

                  <TeamScoreRow
                    team={g.homeTeam}
                    score={(final || live) ? g.homeScore : "—"}
                    highlighted={!final && !live}
                    winner={final && win === "HOME"}
                    tokens={tokens}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    justifyItems: "end",
                    alignContent: "center",
                    gap: 10,
                  }}
                >
                  <span className="pill" style={{ fontWeight: 800 }}>
                    {final
                      ? "FINAL"
                      : isLive(g)
                      ? `${g.liveQuarter === 5 ? "OT" : `Q${g.liveQuarter ?? "?"}`} · ${g.liveClock ?? "--:--"}`
                      : formatKickoff(g.kickoffAt)}
                  </span>

                  <div className="muted" style={{ fontWeight: 700 }}>
                    {formatDay(g.kickoffAt)}
                  </div>

                  <Link className="btn" to={`/schedule/game/${g.id}`}>{t("schedule.details")}</Link>
                </div>
              </div>
            </div>
          );
        })}

        {!games.length && !err && (
          <div className="card" style={{ padding: 14 }}>
            <div className="muted">{t("schedule.noData")}</div>
          </div>
        )}
      </div>
    </div>
  );
}