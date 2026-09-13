import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import WeekDropdown from "../components/WeekDropdown";
import PerfectChallengeCard from "../components/perfect/PerfectChallengeCard";
import { useLanguage } from "../i18n/LanguageContext";
import { useTheme } from "../theme/ThemeContext";
import { getThemeTokens } from "../theme/themeTokens";

const SEASON = 2026;

function ScoreCard({ title, value, sub, tokens }) {
  return (
    <div
      style={{
        minWidth: 180,
        padding: "14px 16px",
        borderRadius: 18,
        border: `1px solid ${tokens.panelBorder}`,
        background: tokens.panelBg,
        boxShadow: tokens.shadow,
        textAlign: "center",
      }}
    >
      <div
        className="muted"
        style={{
          fontSize: 12,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: ".06em",
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          lineHeight: 1,
          marginBottom: sub ? 8 : 0,
          textAlign: "center",
        }}
      >
        {value}
      </div>

      {sub ? (
        <div className="muted" style={{ fontSize: 13, textAlign: "center" }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

function formatScore(value) {
  return Number(value || 0).toFixed(1);
}

export default function PerfectLineup() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const tokens = getThemeTokens(theme);
  const [sp, setSp] = useSearchParams();

  const [weeks, setWeeks] = useState([]);
  const [week, setWeek] = useState(Number(sp.get("week")) || 1);
  const [slots, setSlots] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadWeeks() {
    const res = await api.get("/perfect-challenge/weeks");
    const ws = Array.isArray(res.data?.weeks) ? res.data.weeks : [];
    setWeeks(ws);

    if (!ws.length) return;

    const explicitWeek = sp.get("week");
    if (explicitWeek) {
      const parsed = Number(explicitWeek);
      setWeek(ws.includes(parsed) ? parsed : ws[0]);
      return;
    }

    try {
      const currentRes = await api.get("/schedule/current-week", {
        params: { season: SEASON, stage: "REG" },
      });
      const current = Number(currentRes.data?.week);
      setWeek(ws.includes(current) ? current : ws[0]);
    } catch {
      setWeek(ws[0]);
    }
  }

  async function loadLineup(targetWeek) {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/perfect-challenge/lineup", {
        params: { season: SEASON, week: targetWeek },
      });
      setSlots(res.data?.slots || []);
      setTotalScore(res.data?.totalScore || 0);
    } catch (e) {
      setErr(e?.response?.data?.error || t("perfectLineup.loadError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWeeks().catch(() => setErr(t("perfectLineup.loadWeeksError")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!week) return;

    const currentWeek = sp.get("week") || "";
    if (currentWeek !== String(week)) {
      setSp({ week: String(week) }, { replace: true });
    }

    loadLineup(week);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);

  return (
    <div className="container page">
      <div className="hero">
        <div className="page-header-grid">
          <div>
            <div className="kicker">
              <span className="tag">FANTASY</span>
              <span>{t("perfectLineup.badge")}</span>
            </div>

            <h1 className="h1">{t("perfectLineup.title")}</h1>

            <p className="sub" style={{ maxWidth: 840 }}>
              {t("perfectLineup.subtitle")}
            </p>
          </div>

          <div className="page-header-scores">
            <ScoreCard
              title={t("perfectLineup.totalScoreLabel")}
              value={formatScore(totalScore)}
              tokens={tokens}
            />
          </div>
        </div>

        <div className="filters-bar" style={{ marginTop: 16 }}>
          <WeekDropdown
            value={week}
            options={weeks}
            onChange={setWeek}
            label={t("perfectLineup.weekLabel")}
            width={170}
            formatWeek={(w) => (language === "hu" ? `${w}. hét` : `Week ${w}`)}
          />

          <div className="filters-spacer" />

          <Link to={`/fantasy/perfect-challenge?week=${week}`} className="btn">
            {t("perfectLineup.myPerfectChallenge")}
          </Link>
        </div>
      </div>

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      {loading && !err && (
        <p className="muted" style={{ marginTop: 14 }}>
          {t("perfectLineup.loading")}
        </p>
      )}

      {!loading && !err && (
        <div className="pc-grid" style={{ marginTop: 18 }}>
          {slots.map((slot) => (
            <PerfectChallengeCard
              key={slot.slot}
              slot={slot.slot}
              player={slot.player}
              hidden={false}
              onSelect={undefined}
              readOnly={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}