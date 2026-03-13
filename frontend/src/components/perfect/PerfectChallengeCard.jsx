import { useEffect, useMemo, useState } from "react";
import TeamLogo from "../TeamLogo";

const LABELS = {
  passingYards: "Passing yards",
  passingTDs: "Passing TDs",
  interceptions: "Interceptions",
  rushingYards: "Rushing yards",
  rushingTDs: "Rushing TDs",
  fumble: "Fumble",
  receivedYards: "Received yards",
  receivedTDs: "Received TDs",
  fumbles: "Fumbles",
  fg0to49Yards: "0-49 yards",
  fg50plusYards: "50+ yards",
  xp: "XP",
  interception: "Interception",
  forcedFumble: "Forced fumble",
  sack: "Sack",
  safety: "Safety",
  returnTD: "Return TD",
  allowedPoints: "Allowed points",
  base: "Base",
  allowedPointsPenalty: "Allowed points penalty",
};

const DECIMAL_KEYS = new Set([
  "passingYards",
  "rushingYards",
  "receivedYards",
]);

const SCORE_DECIMAL_KEYS = new Set([
  "passingYards",
  "rushingYards",
  "receivedYards",
  "allowedPointsPenalty",
]);

const STAT_ORDER_BY_POSITION = {
  QB: [
    "passingYards",
    "passingTDs",
    "interceptions",
    "rushingYards",
    "rushingTDs",
    "fumble",
  ],
  RB: [
    "rushingYards",
    "rushingTDs",
    "receivedYards",
    "receivedTDs",
    "fumble",
  ],
  WR: [
    "receivedYards",
    "receivedTDs",
    "rushingYards",
    "rushingTDs",
    "fumbles",
  ],
  TE: [
    "receivedYards",
    "receivedTDs",
    "rushingYards",
    "rushingTDs",
    "fumbles",
  ],
  K: [
    "fg0to49Yards",
    "fg50plusYards",
    "xp",
  ],
  DEF: [
    "interception",
    "forcedFumble",
    "sack",
    "safety",
    "returnTD",
    "allowedPoints",
  ],
};

const BREAKDOWN_ORDER_BY_POSITION = {
  QB: [
    "passingYards",
    "passingTDs",
    "interceptions",
    "rushingYards",
    "rushingTDs",
    "fumble",
  ],
  RB: [
    "rushingYards",
    "rushingTDs",
    "receivedYards",
    "receivedTDs",
    "fumble",
  ],
  WR: [
    "receivedYards",
    "receivedTDs",
    "rushingYards",
    "rushingTDs",
    "fumbles",
  ],
  TE: [
    "receivedYards",
    "receivedTDs",
    "rushingYards",
    "rushingTDs",
    "fumbles",
  ],
  K: [
    "fg0to49Yards",
    "fg50plusYards",
    "xp",
  ],
  DEF: [
    "base",
    "interception",
    "forcedFumble",
    "sack",
    "safety",
    "returnTD",
    "allowedPointsPenalty",
  ],
};

function formatStatValue(key, value) {
  if (value == null) return "-";
  if (DECIMAL_KEYS.has(key)) return Number(value).toFixed(1);
  return value;
}

function formatBreakdownValue(key, value) {
  if (value == null) return "-";
  if (SCORE_DECIMAL_KEYS.has(key)) return Number(value).toFixed(2);
  return Number(value).toFixed(2);
}

function orderedStatRows(position, stats) {
  if (!stats || !position) return [];

  const order = STAT_ORDER_BY_POSITION[position] || [];
  return order.map((key) => ({
    key,
    label: LABELS[key] || key,
    value: formatStatValue(key, stats[key]),
  }));
}

function orderedBreakdownRows(position, breakdown) {
  if (!breakdown || !position) return [];

  const order = BREAKDOWN_ORDER_BY_POSITION[position] || [];
  return order.map((key) => ({
    key,
    label: LABELS[key] || key,
    value: formatBreakdownValue(key, breakdown[key]),
  }));
}

export default function PerfectChallengeCard({
  slot,
  player,
  onSelect,
}) {
  const [flipped, setFlipped] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [backView, setBackView] = useState("stats");

  useEffect(() => {
    setImgFailed(false);
    setBackView("stats");
    setFlipped(false);
  }, [player?.id, slot]);

  const weeklyRows = useMemo(
    () => orderedStatRows(player?.position, player?.weeklyStats),
    [player]
  );

  const breakdownRows = useMemo(
    () =>
      orderedBreakdownRows(
        player?.position,
        player?.weeklyScoreBreakdown?.breakdown
      ),
    [player]
  );

  const breakdownTotal = useMemo(() => {
    const total = player?.weeklyScoreBreakdown?.total;
    return total == null ? "0.00" : Number(total).toFixed(2);
  }, [player]);

  const score = useMemo(() => {
    if (!player) return "0.00";
    return Number(player.currentScore || 0).toFixed(2);
  }, [player]);

  const displayName =
    player?.displayName ||
    `${player?.firstName || ""} ${player?.lastName || ""}`.trim();

  const showHeadshot = !!player?.headshotUrl && !imgFailed;

  function handleImgError() {
    console.warn(
      "[PerfectChallengeCard] Headshot failed:",
      displayName,
      player?.headshotUrl
    );
    setImgFailed(true);
  }

  return (
    <div className="pc-card-wrap">
      <div className={`pc-card ${flipped ? "is-flipped" : ""}`}>
        <div className="pc-card-face pc-card-front">
          <div className="pc-slot-badge">{slot}</div>

          {player ? (
            <>
              <div className="pc-front-content">
                <div className="pc-headshot-wrap">
                  <div className="pc-headshot">
                    {showHeadshot ? (
                      <img
                        src={player.headshotUrl}
                        alt={displayName}
                        onError={handleImgError}
                      />
                    ) : (
                      <div className="pc-headshot-fallback">
                        <TeamLogo team={player.teamCode} size={52} />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="pc-change-overlay"
                    onClick={onSelect}
                    title="Change player"
                  >
                    <span className="pc-change-overlay-text">Change player</span>
                  </button>
                </div>

                <div className="pc-player-topline">
                  <TeamLogo team={player.teamCode} size={20} />
                  <span>{player.teamCode}</span>
                </div>

                <div className="pc-name-block">
                  <div className="pc-first-name">{player.firstName}</div>
                  <div className="pc-last-name">{player.lastName}</div>
                </div>

                <div className="pc-score">{score}</div>
              </div>

              <button
                type="button"
                className="pc-info-btn"
                onClick={() => setFlipped(true)}
                title="Weekly details"
              >
                i
              </button>
            </>
          ) : (
            <>
              <div className="pc-empty-state">
                <div className="pc-empty-title">No player selected</div>
                <div className="pc-empty-sub">
                  Choose a {slot} player for this slot.
                </div>
              </div>

              <button
                type="button"
                className="btn primary"
                onClick={onSelect}
                style={{ marginTop: 18 }}
              >
                Select player
              </button>
            </>
          )}
        </div>

        <div className="pc-card-face pc-card-back">
          <div className="pc-back-header">
            <div className="pc-slot-badge">
              {slot} · {backView === "stats" ? "WEEKLY STATS" : "FANTASY POINTS"}
            </div>

            <button
              type="button"
              className="pc-info-btn pc-info-btn-back"
              onClick={() => setFlipped(false)}
              title="Back"
            >
              ↺
            </button>
          </div>

          {player ? (
            <>
              <div className="pc-back-player">
                <TeamLogo team={player.teamCode} size={18} />
                <span>{displayName}</span>
              </div>

              <div className="pc-back-toggle pc-back-toggle-compact">
                <button
                  type="button"
                  className={`pc-back-toggle-btn ${
                    backView === "stats" ? "active" : ""
                  }`}
                  onClick={() => setBackView("stats")}
                >
                  Stats
                </button>
                <button
                  type="button"
                  className={`pc-back-toggle-btn ${
                    backView === "points" ? "active" : ""
                  }`}
                  onClick={() => setBackView("points")}
                >
                  Points
                </button>
              </div>

              {backView === "stats" ? (
                <div className="pc-stats-grid pc-stats-grid-compact">
                  {weeklyRows.map((row) => (
                    <div key={row.key} className="pc-stat-row pc-stat-row-compact">
                      <span className="pc-stat-label">{row.label}</span>
                      <span className="pc-stat-value">{row.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pc-stats-grid pc-stats-grid-compact">
                  {breakdownRows.map((row) => (
                    <div key={row.key} className="pc-stat-row pc-stat-row-compact">
                      <span className="pc-stat-label">{row.label}</span>
                      <span className="pc-stat-value">{row.value}</span>
                    </div>
                  ))}

                  <div className="pc-stat-row pc-stat-row-total pc-stat-row-compact">
                    <span className="pc-stat-label">Total</span>
                    <span className="pc-stat-value">{breakdownTotal}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="pc-empty-state">
              <div className="pc-empty-title">WEEKLY STATS</div>
              <div className="pc-empty-sub">Select a player first.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}