import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link, useSearchParams } from "react-router-dom";
import WeekDropdown from "../components/WeekDropdown";
import PerfectChallengeCard from "../components/perfect/PerfectChallengeCard";
import PerfectChallengeSelectorModal from "../components/perfect/PerfectChallengeSelectorModal";
import { useLanguage } from "../i18n/LanguageContext";
import { useTheme } from "../theme/ThemeContext";
import { getThemeTokens } from "../theme/themeTokens";

const SEASON = 2026;

const SLOT_TO_POOL_KEY = {
  QB: "QB",
  RB1: "RB",
  RB2: "RB",
  WR1: "WR",
  WR2: "WR",
  TE: "TE",
  K: "K",
  DEF: "DEF",
};

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

export default function PerfectChallenge() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const tokens = getThemeTokens(theme);
  const [sp, setSp] = useSearchParams();

  const requestedWeek = Number(sp.get("week") || 1);
  const viewedUserId = sp.get("userId") || "";

  const [weeks, setWeeks] = useState([]);
  const [week, setWeek] = useState(requestedWeek);
  const [slots, setSlots] = useState([]);
  const [poolByPosition, setPoolByPosition] = useState({});
  const [summary, setSummary] = useState({
    weeklyPoints: 0,
    seasonPoints: 0,
    selectedCount: 0,
    seasonSelectedCount: 0,
  });
  const [viewingUser, setViewingUser] = useState(null);
  const [err, setErr] = useState("");
  const [modalSlot, setModalSlot] = useState(null);

  const isReadOnlyView = Boolean(viewedUserId);

  async function loadWeeks() {
    const res = await api.get("/perfect-challenge/weeks");
    const ws = Array.isArray(res.data?.weeks) ? res.data.weeks : [];

    setWeeks(ws);

    if (!ws.length) {
      setWeek(1);
      return;
    }

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

  async function loadMyWeekData(targetWeek) {
    const res = await api.get("/perfect-challenge/week", {
      params: { season: SEASON, week: targetWeek },
    });

    setSlots(res.data?.slots || []);
    setPoolByPosition(res.data?.poolByPosition || {});
    setSummary(
      res.data?.summary || {
        weeklyPoints: 0,
        seasonPoints: 0,
        selectedCount: 0,
        seasonSelectedCount: 0,
      }
    );
    setViewingUser(null);
  }

  async function loadViewedUserWeekData(targetUserId, targetWeek) {
    const res = await api.get(`/perfect-challenge/user/${targetUserId}/roster`, {
      params: { season: SEASON, week: targetWeek },
    });

    setSlots(res.data?.slots || []);
    setPoolByPosition({});
    setSummary({
      weeklyPoints: res.data?.summary?.weeklyPoints || 0,
      seasonPoints: res.data?.summary?.seasonPoints || 0,
      selectedCount: res.data?.summary?.selectedCount || 0,
      seasonSelectedCount: 0,
    });
    setViewingUser(res.data?.user || null);
  }

  useEffect(() => {
    loadWeeks().catch(() => setErr(t("perfectChallenge.loadWeeksError")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!week) return;

    const nextParams = { week: String(week) };
    if (viewedUserId) nextParams.userId = viewedUserId;

    const currentWeek = sp.get("week") || "";
    const currentUserId = sp.get("userId") || "";

    if (
      currentWeek !== String(week) ||
      currentUserId !== (viewedUserId || "")
    ) {
      setSp(nextParams, { replace: true });
    }

    setErr("");
    setModalSlot(null);

    const loader = viewedUserId
      ? loadViewedUserWeekData(viewedUserId, week)
      : loadMyWeekData(week);

    loader.catch((e) =>
      setErr(
        e?.response?.data?.error ||
          t("perfectChallenge.loadDataError")
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week, viewedUserId]);

  async function pickPlayer(playerId) {
    if (!modalSlot || isReadOnlyView) return;

    try {
      await api.put("/perfect-challenge/slot", {
        season: SEASON,
        week,
        slot: modalSlot.slot,
        playerId,
      });

      setModalSlot(null);
      await loadMyWeekData(week);
    } catch (e) {
      setErr(e?.response?.data?.error || t("perfectChallenge.updateSlotError"));
    }
  }

  const filledCount = useMemo(
    () => slots.filter((s) => !!s.player).length,
    [slots]
  );

  const modalPlayers = modalSlot
    ? poolByPosition[SLOT_TO_POOL_KEY[modalSlot.slot]] || []
    : [];

  return (
    <div className="container page">
      <div className="hero">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) auto",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div>
            <div className="kicker">
              <span className="tag">FANTASY</span>
              <span>
                {isReadOnlyView ? t("perfectChallenge.viewerBadge") : t("perfectChallenge.badge")}
              </span>
            </div>

            <h1 className="h1">
              {isReadOnlyView && viewingUser
                ? (language === "hu"
                    ? `${viewingUser.username} választásai · Perfect Challenge`
                    : `${viewingUser.username}'s picks · Perfect Challenge`)
                : "Perfect Challenge"}
            </h1>

            <p className="sub" style={{ maxWidth: 840 }}>
              {isReadOnlyView
                ? t("perfectChallenge.viewerSubtitle")
                : t("perfectChallenge.ownSubtitle")}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <ScoreCard
              title={t("perfectChallenge.weeklyPoints")}
              value={formatScore(summary.weeklyPoints)}
              tokens={tokens}
            />

            <ScoreCard
              title={t("perfectChallenge.seasonTotal")}
              value={formatScore(summary.seasonPoints)}
              tokens={tokens}
            />
          </div>
        </div>

        <div className="filters-bar" style={{ marginTop: 16 }}>
          <WeekDropdown
            value={week}
            options={weeks}
            onChange={setWeek}
            label={t("perfectChallenge.weekLabel")}
            width={170}
            formatWeek={(w) => (language === "hu" ? `${w}. hét` : `Week ${w}`)}
          />

         <div className="filters-spacer" />

          <Link to="/fantasy/perfect-challenge/rules" className="btn">
            {t("perfectChallenge.rules")}
          </Link>

          {isReadOnlyView ? (
            <>
              <Link
                to={`/fantasy/perfect-challenge/leaderboard?week=${week}`}
                className="btn"
              >
                {t("perfectChallenge.backToLeaderboard")}
              </Link>

              <Link
                to={`/fantasy/perfect-challenge?week=${week}`}
                className="btn primary"
              >
                {t("perfectChallenge.myPerfectChallenge")}
              </Link>
            </>
          ) : (
            <Link
              to={`/fantasy/perfect-challenge/leaderboard?week=${week}`}
              className="btn"
            >
              {t("perfectChallenge.leaderboard")}
            </Link>
          )}

          <span className="pill">
            <span className="dot" />
            {filledCount}/8 {t("perfectChallenge.visibleSuffix")}
          </span>
        </div>
      </div>

      {err && (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      )}

      <div className="pc-grid" style={{ marginTop: 18 }}>
        {slots.map((slot) => (
          <PerfectChallengeCard
            key={slot.slot}
            slot={slot.slot}
            player={slot.player}
            hidden={Boolean(slot.hidden)}
            onSelect={isReadOnlyView || slot.locked ? undefined : () => setModalSlot(slot)}
            readOnly={isReadOnlyView || Boolean(slot.locked)}
          />
        ))}
      </div>

      {!isReadOnlyView && (
        <PerfectChallengeSelectorModal
          open={!!modalSlot}
          title={modalSlot ? `${t("perfectChallenge.selectPlayerFor")} ${modalSlot.slot}` : ""}
          players={modalPlayers}
          onClose={() => setModalSlot(null)}
          onPick={pickPlayer}
        />
      )}
    </div>
  );
}