import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import PerfectChallengeCard from "../components/perfect/PerfectChallengeCard";
import PerfectChallengeSelectorModal from "../components/perfect/PerfectChallengeSelectorModal";
import SimpleDropdown from "../components/SimpleDropdown";
import { useLanguage } from "../i18n/LanguageContext";
import { useTheme } from "../theme/ThemeContext";
import { getThemeTokens } from "../theme/themeTokens";

const SEASON = 2025;

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

export default function PlayoffChallenge() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const tokens = getThemeTokens(theme);
  const [sp, setSp] = useSearchParams();

  const requestedRound = String(sp.get("round") || "WILDCARD");
  const viewedUserId = sp.get("userId") || "";

  const [rounds, setRounds] = useState([]);
  const [round, setRound] = useState(requestedRound);
  const [roundLabel, setRoundLabel] = useState("Wildcard Weekend");
  const [slots, setSlots] = useState([]);
  const [poolByPosition, setPoolByPosition] = useState({});
  const [summary, setSummary] = useState({
    roundPoints: 0,
    playoffTotal: 0,
    selectedCount: 0,
  });
  const [viewingUser, setViewingUser] = useState(null);
  const [multiplierDetails, setMultiplierDetails] = useState([]);
  const [modalSlot, setModalSlot] = useState(null);
  const [err, setErr] = useState("");

  const isReadOnlyView = Boolean(viewedUserId);

  async function loadRounds() {
    const res = await api.get("/playoff-challenge/rounds");
    const items = Array.isArray(res.data?.rounds) ? res.data.rounds : [];

    setRounds(items);

    if (!items.length) {
      setRound("WILDCARD");
      return;
    }

    const safeRound = items.some((item) => item.value === requestedRound)
      ? requestedRound
      : items[0].value;

    setRound(safeRound);
  }

  async function loadMyRoundData(targetRound) {
    const res = await api.get("/playoff-challenge/round", {
      params: { season: SEASON, round: targetRound },
    });

    setRoundLabel(res.data?.roundLabel || targetRound);
    setSlots(res.data?.slots || []);
    setPoolByPosition(res.data?.poolByPosition || {});
    setSummary(
      res.data?.summary || {
        roundPoints: 0,
        playoffTotal: 0,
        selectedCount: 0,
      }
    );
    setMultiplierDetails(res.data?.multiplierDetails || []);
    setViewingUser(null);
  }

  async function loadViewedUserRoundData(targetUserId, targetRound) {
    const res = await api.get(`/playoff-challenge/user/${targetUserId}/roster`, {
      params: { season: SEASON, round: targetRound },
    });

    setRoundLabel(res.data?.roundLabel || targetRound);
    setSlots(res.data?.slots || []);
    setPoolByPosition({});
    setSummary(
      res.data?.summary || {
        roundPoints: 0,
        playoffTotal: 0,
        selectedCount: 0,
      }
    );
    setMultiplierDetails(res.data?.multiplierDetails || []);
    setViewingUser(res.data?.user || null);
  }

  useEffect(() => {
    loadRounds().catch(() =>
      setErr(t("playoffChallenge.loadRoundsError"))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!round) return;

    const nextParams = { round };
    if (viewedUserId) nextParams.userId = viewedUserId;

    const currentRound = sp.get("round") || "";
    const currentUserId = sp.get("userId") || "";

    if (currentRound !== round || currentUserId !== (viewedUserId || "")) {
      setSp(nextParams, { replace: true });
    }

    setErr("");
    setModalSlot(null);

    const loader = viewedUserId
      ? loadViewedUserRoundData(viewedUserId, round)
      : loadMyRoundData(round);

    loader.catch((e) =>
      setErr(
        e?.response?.data?.error ||
          t("playoffChallenge.loadDataError")
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, viewedUserId]);

  async function pickPlayer(playerId) {
    if (!modalSlot || isReadOnlyView) return;

    try {
      await api.put("/playoff-challenge/slot", {
        season: SEASON,
        round,
        slot: modalSlot.slot,
        playerId,
      });

      setModalSlot(null);
      await loadMyRoundData(round);
    } catch (e) {
      setErr(
        e?.response?.data?.error || t("playoffChallenge.updateSlotError")
      );
    }
  }

  const modalPlayers = modalSlot
    ? poolByPosition[SLOT_TO_POOL_KEY[modalSlot.slot]] || []
    : [];

  const visibleCount = useMemo(
    () => slots.filter((slot) => !!slot.player).length,
    [slots]
  );

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
                {isReadOnlyView ? t("playoffChallenge.viewerBadge") : t("playoffChallenge.badge")}
              </span>
            </div>

            <h1 className="h1">
              {isReadOnlyView && viewingUser
                ? (language === "hu"
                    ? `${viewingUser.username} választásai · Playoff Challenge`
                    : `${viewingUser.username}'s picks · Playoff Challenge`)
                : "Playoff Challenge"}
            </h1>

            <p className="sub" style={{ maxWidth: 900 }}>
              {isReadOnlyView
                ? t("playoffChallenge.viewerSubtitle")
                : t("playoffChallenge.ownSubtitle")}
            </p>

            <div
              className="muted"
              style={{
                marginTop: 10,
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {t("playoffChallenge.multiplierLegend")}
            </div>
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
              title={t("playoffChallenge.roundPoints")}
              value={formatScore(summary.roundPoints)}
              sub={roundLabel}
              tokens={tokens}
            />

            <ScoreCard
              title={t("playoffChallenge.playoffTotal")}
              value={formatScore(summary.playoffTotal)}
              sub={`${summary.selectedCount}/8 ${t("playoffChallenge.visibleSuffix")}`}
              tokens={tokens}
            />
          </div>
        </div>

        <div className="filters-bar" style={{ marginTop: 16 }}>
          <SimpleDropdown
            value={round}
            options={rounds}
            onChange={setRound}
            label={t("playoffChallenge.roundLabel")}
            width={200}
          />

          <div className="filters-spacer" />

          <Link to="/fantasy/playoff-challenge/rules" className="btn">
            {t("playoffChallenge.rules")}
          </Link>

          {isReadOnlyView ? (
            <>
              <Link
                to={`/fantasy/playoff-challenge/leaderboard?round=${round}`}
                className="btn"
              >
                {t("playoffChallenge.backToLeaderboard")}
              </Link>

              <Link
                to={`/fantasy/playoff-challenge?round=${round}`}
                className="btn primary"
              >
                {t("playoffChallenge.myPlayoffChallenge")}
              </Link>
            </>
          ) : (
            <Link
              to={`/fantasy/playoff-challenge/leaderboard?round=${round}`}
              className="btn"
            >
              {t("playoffChallenge.leaderboard")}
            </Link>
          )}

          <span className="pill">
            <span className="dot" />
            {visibleCount}/8 {t("playoffChallenge.visibleSuffix")}
          </span>
        </div>
      </div>

      {err ? (
        <p className="error" style={{ marginTop: 14 }}>
          {err}
        </p>
      ) : null}

      {!!multiplierDetails.length && (
        <div className="card" style={{ marginTop: 16, padding: 16 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              marginBottom: 10,
              color: "#f8fbff",
            }}
          >
            {t("playoffChallenge.currentMultipliers")}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {multiplierDetails.map((item) => (
              <span
                key={`${item.slot}-${item.playerKey}`}
                className="pill"
                style={{ fontWeight: 800 }}
              >
                {item.slot}: {item.displayName} ×{item.multiplier} (
                {formatScore(item.multipliedScore)})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pc-grid" style={{ marginTop: 18 }}>
        {slots.map((slot) => (
          <PerfectChallengeCard
            key={slot.slot}
            slot={slot.slot}
            player={slot.player}
            hidden={Boolean(slot.hidden)}
            onSelect={isReadOnlyView ? undefined : () => setModalSlot(slot)}
            readOnly={isReadOnlyView}
          />
        ))}
      </div>

      {!isReadOnlyView && (
        <PerfectChallengeSelectorModal
          open={!!modalSlot}
          title={modalSlot ? `${t("playoffChallenge.selectPlayerFor")} ${modalSlot.slot}` : ""}
          players={modalPlayers}
          onClose={() => setModalSlot(null)}
          onPick={pickPlayer}
          modeLabel="Playoff Challenge"
          periodType="round"
        />
      )}
    </div>
  );
}