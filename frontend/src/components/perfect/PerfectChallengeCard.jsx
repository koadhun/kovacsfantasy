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
  K: ["fg0to49Yards", "fg50plusYards", "xp"],
  DEF: ["interception", "forcedFumble", "sack", "safety", "returnTD", "allowedPoints"],
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
  K: ["fg0to49Yards", "fg50plusYards", "xp"],
  DEF: ["base", "interception", "forcedFumble", "sack", "safety", "returnTD", "allowedPointsPenalty"],
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
    if (!player) return "0.0";
    return Number(player.currentScore || 0).toFixed(1);
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
                      <TeamLogo team={player.teamCode} size={68} />
                    )}
                  </div>

                  <button className="pc-change-btn" onClick={onSelect}>
                    Change player
                  </button>
                </div>

                <div className="pc-front-meta">
                  <div className="pc-team-line">
                    <TeamLogo team={player.teamCode} size={16} />
                    <span>{player.teamCode}</span>
                  </div>

                  <div className="pc-first-name">{player.firstName}</div>
                  <div className="pc-last-name">{player.lastName}</div>

                  <div className="pc-score">{score}</div>
                </div>
              </div>

              <button
                className="pc-info-btn"
                onClick={() => setFlipped(true)}
                title="Weekly details"
              >
                i
              </button>
            </>
          ) : (
            <>
              <div className="pc-empty-title">No player selected</div>
              <div className="pc-empty-sub">
                Choose a {slot} player for this slot.
              </div>
              <button className="btn primary" onClick={onSelect}>
                Select player
              </button>
            </>
          )}
        </div>

        <div className="pc-card-face pc-card-back">
          <div className="pc-back-head">
            <div className="pc-slot-badge">
              {slot} · {backView === "stats" ? "WEEKLY STATS" : "FANTASY POINTS"}
            </div>

            <button
              className="pc-back-btn"
              onClick={() => setFlipped(false)}
              title="Back"
            >
              ↺
            </button>
          </div>

          {player ? (
            <>
              <div className="pc-back-player-name">{displayName}</div>

              <div className="pc-back-tabs">
                <button
                  className={`pc-back-tab ${backView === "stats" ? "active" : ""}`}
                  onClick={() => setBackView("stats")}
                >
                  Stats
                </button>

                <button
                  className={`pc-back-tab ${backView === "points" ? "active" : ""}`}
                  onClick={() => setBackView("points")}
                >
                  Points
                </button>
              </div>

              {backView === "stats" ? (
                <div className="pc-stat-list">
                  {weeklyRows.map((row) => (
                    <div key={row.key} className="pc-stat-row">
                      <span>{row.label}</span>
                      <strong>{row.value}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pc-stat-list">
                  {breakdownRows.map((row) => (
                    <div key={row.key} className="pc-stat-row">
                      <span>{row.label}</span>
                      <strong>{row.value}</strong>
                    </div>
                  ))}

                  <div className="pc-stat-row total">
                    <span>Total</span>
                    <strong>{breakdownTotal}</strong>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="pc-empty-back">
              <div className="pc-slot-badge">WEEKLY STATS</div>
              <p className="muted" style={{ marginTop: 14 }}>
                Select a player first.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}