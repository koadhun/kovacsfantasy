import { useMemo, useState } from "react";
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
};

const DECIMAL_KEYS = new Set([
  "passingYards",
  "rushingYards",
  "receivedYards",
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

function formatValue(key, value) {
  if (value == null) return "-";
  if (DECIMAL_KEYS.has(key)) return Number(value).toFixed(1);
  return value;
}

function orderedStatRows(position, stats) {
  if (!stats || !position) return [];

  const order = STAT_ORDER_BY_POSITION[position] || [];
  return order.map((key) => ({
    key,
    label: LABELS[key] || key,
    value: formatValue(key, stats[key]),
  }));
}

export default function PerfectChallengeCard({
  slot,
  player,
  onSelect,
}) {
  const [flipped, setFlipped] = useState(false);

  const weeklyRows = useMemo(
    () => orderedStatRows(player?.position, player?.weeklyStats),
    [player]
  );

  const score = useMemo(() => {
    if (!player) return "0.0";
    return Number(player.currentScore || 0).toFixed(1);
  }, [player]);

  const displayName =
    player?.displayName ||
    `${player?.firstName || ""} ${player?.lastName || ""}`.trim();

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
                    {player.headshotUrl ? (
                      <img src={player.headshotUrl} alt={displayName} />
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
                title="Weekly stats"
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
          <div className="pc-slot-badge">{slot} · WEEKLY STATS</div>

          {player ? (
            <>
              <div className="pc-back-player">
                <TeamLogo team={player.teamCode} size={18} />
                <span>{displayName}</span>
              </div>

              <div className="pc-stats-grid">
                {weeklyRows.map((row) => (
                  <div key={row.key} className="pc-stat-row">
                    <span className="pc-stat-label">{row.label}</span>
                    <span className="pc-stat-value">{row.value}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="pc-info-btn"
                onClick={() => setFlipped(false)}
                title="Back"
              >
                ↺
              </button>
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