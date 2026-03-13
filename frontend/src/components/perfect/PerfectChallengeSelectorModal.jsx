import { useEffect, useMemo, useState } from "react";
import TeamLogo from "../TeamLogo";

const PLAYER_WEEKLY_LABELS = {
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

const DEFENSE_LABELS = {
  interception: "Interception",
  forcedFumble: "Forced fumble",
  sack: "Sack",
  safety: "Safety",
  returnTD: "Return TD",
  allowedPoints: "Allowed points",
  allowedPassingYards: "Allowed passing yards",
  allowedRushingYards: "Allowed rushing yards",
};

const PLAYER_STAT_ORDER_BY_POSITION = {
  QB: ["passingYards", "passingTDs", "interceptions", "rushingYards", "rushingTDs", "fumble"],
  RB: ["rushingYards", "rushingTDs", "receivedYards", "receivedTDs", "fumble"],
  WR: ["receivedYards", "receivedTDs", "rushingYards", "rushingTDs", "fumbles"],
  TE: ["receivedYards", "receivedTDs", "rushingYards", "rushingTDs", "fumbles"],
  K: ["fg0to49Yards", "fg50plusYards", "xp"],
  DEF: ["interception", "forcedFumble", "sack", "safety", "returnTD", "allowedPoints"],
};

const DEFENSE_STAT_ORDER = [
  "interception",
  "forcedFumble",
  "sack",
  "safety",
  "returnTD",
  "allowedPoints",
  "allowedPassingYards",
  "allowedRushingYards",
];

const DECIMAL_KEYS = new Set([
  "passingYards",
  "rushingYards",
  "receivedYards",
  "allowedPassingYards",
  "allowedRushingYards",
]);

function formatValue(key, value) {
  if (value == null) return "-";
  if (DECIMAL_KEYS.has(key)) return Number(value).toFixed(1);
  return value;
}

function buildPlayerWeeklyRows(player) {
  if (!player) return [];
  const order = PLAYER_STAT_ORDER_BY_POSITION[player.position] || [];
  return order.map((key) => ({
    key,
    label: PLAYER_WEEKLY_LABELS[key] || key,
    value: formatValue(key, player.weeklyStats?.[key]),
  }));
}

function buildDefenseRows(defense) {
  if (!defense) return [];
  return DEFENSE_STAT_ORDER.map((key) => {
    let value;

    if (key === "allowedPassingYards") value = defense.allowedPassingYards;
    else if (key === "allowedRushingYards") value = defense.allowedRushingYards;
    else value = defense.overallStats?.[key];

    return {
      key,
      label: DEFENSE_LABELS[key] || key,
      value: formatValue(key, value),
    };
  });
}

function PlayerOptionImage({ player, displayName }) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [player?.id]);

  const showHeadshot = !!player?.headshotUrl && !imgFailed;

  return (
    <div className="pc-player-option-image">
      {showHeadshot ? (
        <img
          src={player.headshotUrl}
          alt={displayName}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <TeamLogo team={player.teamCode} size={32} />
      )}
    </div>
  );
}

function PlayerPreviewImage({ player, displayName }) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [player?.id]);

  const showHeadshot = !!player?.headshotUrl && !imgFailed;

  return (
    <div className="pc-preview-image pc-preview-image-compact">
      {showHeadshot ? (
        <img
          src={player.headshotUrl}
          alt={displayName}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <TeamLogo team={player.teamCode} size={50} />
      )}
    </div>
  );
}

export default function PerfectChallengeSelectorModal({
  open,
  title,
  players = [],
  defensePlayers = [],
  onClose,
  onPick,
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  useEffect(() => {
    if (open && players.length) setSelectedPlayerId(players[0].id);
    else if (!players.length) setSelectedPlayerId(null);
  }, [open, players]);

  const selectedPlayer = useMemo(
    () => players.find((p) => p.id === selectedPlayerId) || null,
    [players, selectedPlayerId]
  );

  const opponentDefense = useMemo(() => {
    if (!selectedPlayer) return null;

    if (selectedPlayer.position === "DEF") {
      return selectedPlayer;
    }

    return (
      defensePlayers.find(
        (d) => d.teamCode === selectedPlayer.currentWeekOpponentDefenseTeamCode
      ) || null
    );
  }, [selectedPlayer, defensePlayers]);

  const weeklyRows = useMemo(
    () => buildPlayerWeeklyRows(selectedPlayer),
    [selectedPlayer]
  );

  const defenseRows = useMemo(
    () => buildDefenseRows(opponentDefense),
    [opponentDefense]
  );

  if (!open) return null;

  return (
    <div className="pc-modal-backdrop" onClick={onClose}>
      <div className="pc-modal pc-modal-wide pc-modal-tight" onClick={(e) => e.stopPropagation()}>
        <div className="pc-modal-head pc-modal-head-tight">
          <div>
            <div className="pc-modal-kicker">Perfect Challenge</div>
            <h3 style={{ margin: "4px 0 0 0" }}>{title}</h3>
          </div>

          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="pc-picker-layout pc-picker-layout-tight">
          <div className="pc-picker-left">
            <div className="pc-modal-list pc-modal-list-tight">
              {players.map((player) => {
                const displayName =
                  player.displayName || `${player.firstName} ${player.lastName}`;

                return (
                  <button
                    key={player.id}
                    type="button"
                    className={`pc-player-option ${
                      selectedPlayerId === player.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedPlayerId(player.id)}
                  >
                    <div className="pc-player-option-left">
                      <PlayerOptionImage player={player} displayName={displayName} />

                      <div>
                        <div className="pc-player-option-name">{displayName}</div>
                        <div className="pc-player-option-meta">
                          <TeamLogo team={player.teamCode} size={14} />
                          <span>{player.teamCode}</span>
                          <span>·</span>
                          <span>{player.position}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pc-player-option-right">
                      <div className="pc-player-option-score">
                        {Number(player.avgScore || 0).toFixed(1)}
                      </div>
                      <div className="muted" style={{ fontSize: 11 }}>
                        pts
                      </div>
                    </div>
                  </button>
                );
              })}

              {!players.length && (
                <div className="muted">No players available for this slot.</div>
              )}
            </div>
          </div>

          <div className="pc-picker-right">
            {selectedPlayer ? (
              <>
                <div className="pc-side-card pc-side-card-tight">
                  <div className="pc-side-card-head pc-side-card-head-tight">
                    <div className="pc-side-player-main">
                      <PlayerPreviewImage
                        player={selectedPlayer}
                        displayName={
                          selectedPlayer.displayName ||
                          `${selectedPlayer.firstName} ${selectedPlayer.lastName}`
                        }
                      />

                      <div>
                        <div className="pc-side-player-name pc-side-player-name-tight">
                          {selectedPlayer.displayName ||
                            `${selectedPlayer.firstName} ${selectedPlayer.lastName}`}
                        </div>

                        <div className="pc-side-player-meta">
                          <TeamLogo team={selectedPlayer.teamCode} size={14} />
                          <span>{selectedPlayer.teamCode}</span>
                          <span>·</span>
                          <span>{selectedPlayer.position}</span>
                        </div>
                      </div>
                    </div>

                    <button className="btn primary" onClick={() => onPick(selectedPlayer.id)}>
                      Select player
                    </button>
                  </div>

                  <div className="pc-side-section-title">
                    Last week vs {selectedPlayer.lastWeekOpponentTeam || "-"}
                  </div>

                  <div className="pc-side-stats pc-side-stats-tight">
                    {weeklyRows.map((row) => (
                      <div key={row.key} className="pc-side-stat-row pc-side-stat-row-tight">
                        <span>{row.label}</span>
                        <strong>{row.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pc-side-card pc-side-card-tight">
                  <div className="pc-side-section-title">
                    {selectedPlayer.position === "DEF"
                      ? "Defense season stats"
                      : "Opponent's defense stats"}
                  </div>

                  {opponentDefense ? (
                    <>
                      <div className="pc-side-player-meta pc-side-defense-meta">
                        <TeamLogo team={opponentDefense.teamCode} size={14} />
                        <span>{opponentDefense.displayName || opponentDefense.teamCode}</span>
                      </div>

                      <div className="pc-side-stats pc-side-stats-tight">
                        {defenseRows.map((row) => (
                          <div key={row.key} className="pc-side-stat-row pc-side-stat-row-tight">
                            <span>{row.label}</span>
                            <strong>{row.value}</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="muted">No defense stats available.</div>
                  )}
                </div>
              </>
            ) : (
              <div className="pc-side-card pc-side-card-tight">
                <div className="muted">Select a player from the left side.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}