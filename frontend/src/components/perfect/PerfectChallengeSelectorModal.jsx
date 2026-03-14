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
  allowedPassingYards: "Allowed passing yards",
  allowedRushingYards: "Allowed rushing yards",
  interception: "Interception",
  forcedFumble: "Forced fumble",
  sack: "Sack",
  returnTD: "Return TD",
  safety: "Safety",
  allowedPoints: "Allowed points",
};

const OFFENSE_LABELS = {
  passingYards: "Passing yards",
  passingTDs: "Passing TDs",
  interceptions: "Interceptions",
  rushingYards: "Rushing yards",
  rushingTDs: "Rushing TDs",
  fumbles: "Fumbles",
  avgPoints: "Average points",
};

const PLAYER_STAT_ORDER_BY_POSITION = {
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

const DEFENSE_STAT_ORDER = [
  "allowedPassingYards",
  "allowedRushingYards",
  "interception",
  "forcedFumble",
  "sack",
  "returnTD",
  "safety",
  "allowedPoints",
];

const OFFENSE_STAT_ORDER = [
  "passingYards",
  "passingTDs",
  "interceptions",
  "rushingYards",
  "rushingTDs",
  "fumbles",
  "avgPoints",
];

const DECIMAL_KEYS = new Set([
  "passingYards",
  "rushingYards",
  "receivedYards",
  "allowedPassingYards",
  "allowedRushingYards",
  "passingTDs",
  "interceptions",
  "rushingTDs",
  "fumbles",
  "avgPoints",
]);

const MATCHUP_COLORS = {
  great: {
    background: "rgba(34, 197, 94, 0.12)",
    border: "rgba(34, 197, 94, 0.35)",
    text: "#86efac",
    value: "#dcfce7",
  },
  tough: {
    background: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.35)",
    text: "#fca5a5",
    value: "#fee2e2",
  },
  neutral: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "rgba(255, 255, 255, 0.06)",
    text: "rgba(255,255,255,0.82)",
    value: "#ffffff",
  },
};

function formatValue(key, value) {
  if (value == null) return "-";
  if (DECIMAL_KEYS.has(key)) return Number(value).toFixed(1);
  return value;
}

function getDisplayName(player) {
  return player?.displayName || `${player?.firstName || ""} ${player?.lastName || ""}`.trim();
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
      rawValue: value,
      value: formatValue(key, value),
    };
  });
}

function buildOffenseRows(offenseStats) {
  if (!offenseStats) return [];

  return OFFENSE_STAT_ORDER.map((key) => ({
    key,
    label: OFFENSE_LABELS[key] || key,
    value: formatValue(key, offenseStats[key]),
  }));
}

function getMatchupTone(position, key, rawValue) {
  if (rawValue == null) return "neutral";
  if (position === "DEF") return "neutral";

  if (position === "QB") {
    if (key === "allowedPassingYards") {
      if (rawValue >= 245) return "great";
      if (rawValue <= 205) return "tough";
    }
    if (key === "interception") {
      if (rawValue <= 7) return "great";
      if (rawValue >= 15) return "tough";
    }
    if (key === "sack") {
      if (rawValue <= 24) return "great";
      if (rawValue >= 38) return "tough";
    }
    if (key === "allowedPoints") {
      if (rawValue >= 24) return "great";
      if (rawValue <= 18) return "tough";
    }
  }

  if (position === "RB") {
    if (key === "allowedRushingYards") {
      if (rawValue >= 118) return "great";
      if (rawValue <= 92) return "tough";
    }
    if (key === "forcedFumble") {
      if (rawValue <= 6) return "great";
      if (rawValue >= 12) return "tough";
    }
    if (key === "allowedPoints") {
      if (rawValue >= 24) return "great";
      if (rawValue <= 18) return "tough";
    }
  }

  if (position === "WR" || position === "TE") {
    if (key === "allowedPassingYards") {
      if (rawValue >= 235) return "great";
      if (rawValue <= 200) return "tough";
    }
    if (key === "interception") {
      if (rawValue <= 7) return "great";
      if (rawValue >= 15) return "tough";
    }
    if (key === "sack") {
      if (rawValue <= 25) return "great";
      if (rawValue >= 38) return "tough";
    }
    if (key === "allowedPoints") {
      if (rawValue >= 24) return "great";
      if (rawValue <= 18) return "tough";
    }
  }

  if (position === "K") {
    if (key === "allowedPoints") {
      if (rawValue >= 24) return "great";
      if (rawValue <= 18) return "tough";
    }
  }

  return "neutral";
}

function getOverallMatchupSummary(position, defenseRows) {
  if (!defenseRows.length || position === "DEF") {
    return {
      label: "Neutral matchup",
      tone: "neutral",
      detail: "General opponent overview.",
    };
  }

  const relevantKeysByPosition = {
    QB: ["allowedPassingYards", "interception", "sack", "allowedPoints"],
    RB: ["allowedRushingYards", "forcedFumble", "allowedPoints"],
    WR: ["allowedPassingYards", "interception", "sack", "allowedPoints"],
    TE: ["allowedPassingYards", "interception", "sack", "allowedPoints"],
    K: ["allowedPoints"],
  };

  const relevantKeys = relevantKeysByPosition[position] || [];
  let score = 0;

  defenseRows.forEach((row) => {
    if (!relevantKeys.includes(row.key)) return;
    const tone = getMatchupTone(position, row.key, row.rawValue);
    if (tone === "great") score += 1;
    if (tone === "tough") score -= 1;
  });

  if (score >= 2) {
    return {
      label: "Great matchup",
      tone: "great",
      detail:
        position === "RB"
          ? "Rush defense looks beatable."
          : "Pass matchup looks favorable.",
    };
  }

  if (score <= -2) {
    return {
      label: "Tough matchup",
      tone: "tough",
      detail:
        position === "RB"
          ? "Rush defense looks difficult."
          : "Passing matchup looks difficult.",
    };
  }

  return {
    label: "Neutral matchup",
    tone: "neutral",
    detail: "Mixed opponent indicators.",
  };
}

function getHighlightHint(position, defenseRows) {
  const passRow = defenseRows.find((row) => row.key === "allowedPassingYards");
  const rushRow = defenseRows.find((row) => row.key === "allowedRushingYards");

  if ((position === "QB" || position === "WR" || position === "TE") && passRow) {
    const tone = getMatchupTone(position, "allowedPassingYards", passRow.rawValue);
    if (tone === "great") return { text: "Pass matchup advantage", tone: "great" };
    if (tone === "tough") return { text: "Pass matchup warning", tone: "tough" };
  }

  if (position === "RB" && rushRow) {
    const tone = getMatchupTone(position, "allowedRushingYards", rushRow.rawValue);
    if (tone === "great") return { text: "Rush matchup advantage", tone: "great" };
    if (tone === "tough") return { text: "Rush matchup warning", tone: "tough" };
  }

  return null;
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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlayers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return players;

    return players.filter((player) => {
      const displayName = getDisplayName(player).toLowerCase();
      const teamCode = (player.teamCode || "").toLowerCase();
      return displayName.includes(query) || teamCode.includes(query);
    });
  }, [players, searchTerm]);

  useEffect(() => {
    if (!open) {
      setSelectedPlayerId(null);
      setSearchTerm("");
      return;
    }

    if (filteredPlayers.length) {
      setSelectedPlayerId((currentId) => {
        const exists = filteredPlayers.some((player) => player.id === currentId);
        return exists ? currentId : filteredPlayers[0].id;
      });
    } else {
      setSelectedPlayerId(null);
    }
  }, [open, filteredPlayers]);

  const selectedPlayer = useMemo(
    () => filteredPlayers.find((player) => player.id === selectedPlayerId) || null,
    [filteredPlayers, selectedPlayerId]
  );

  const isWeekOne = Number(selectedPlayer?.week) === 1;

  const opponentDefense = useMemo(() => {
    if (!selectedPlayer || isWeekOne || selectedPlayer.position === "DEF") return null;

    return (
      defensePlayers.find(
        (defensePlayer) =>
          defensePlayer.teamCode === selectedPlayer.currentWeekOpponentDefenseTeamCode
      ) || null
    );
  }, [selectedPlayer, defensePlayers, isWeekOne]);

  const opponentOffenseStats = useMemo(() => {
    if (!selectedPlayer || isWeekOne || selectedPlayer.position !== "DEF") return null;
    return selectedPlayer.currentWeekOpponentOffenseStats || null;
  }, [selectedPlayer, isWeekOne]);

  const weeklyRows = useMemo(() => {
    if (!selectedPlayer || isWeekOne) return [];
    return buildPlayerWeeklyRows(selectedPlayer);
  }, [selectedPlayer, isWeekOne]);

  const defenseRows = useMemo(() => {
    if (!opponentDefense || isWeekOne) return [];
    return buildDefenseRows(opponentDefense);
  }, [opponentDefense, isWeekOne]);

  const offenseRows = useMemo(() => {
    if (!opponentOffenseStats || isWeekOne) return [];
    return buildOffenseRows(opponentOffenseStats);
  }, [opponentOffenseStats, isWeekOne]);

  const matchupSummary = useMemo(
    () => getOverallMatchupSummary(selectedPlayer?.position, defenseRows),
    [selectedPlayer?.position, defenseRows]
  );

  const highlightHint = useMemo(
    () => getHighlightHint(selectedPlayer?.position, defenseRows),
    [selectedPlayer?.position, defenseRows]
  );

  if (!open) return null;

  return (
    <div className="pc-modal-backdrop" onClick={onClose}>
      <div
        className="pc-modal pc-modal-wide pc-modal-tight"
        onClick={(e) => e.stopPropagation()}
      >
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
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                className="input"
                placeholder="Search player by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div
              className="pc-modal-list pc-modal-list-tight"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                maxHeight: "calc(100vh - 250px)",
                overflowY: "auto",
                paddingRight: 6,
              }}
            >
              {filteredPlayers.map((player) => {
                const displayName = getDisplayName(player);

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

                        <div
                          className="muted"
                          style={{ fontSize: 13, marginTop: 4, fontWeight: 600 }}
                        >
                          vs {player.currentWeekOpponentTeam || "-"}
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

              {!filteredPlayers.length && players.length > 0 && (
                <div className="muted">No players found for "{searchTerm}".</div>
              )}

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
                        displayName={getDisplayName(selectedPlayer)}
                      />

                      <div>
                        <div className="pc-side-player-name pc-side-player-name-tight">
                          {getDisplayName(selectedPlayer)}
                        </div>

                        <div className="pc-side-player-meta">
                          <TeamLogo team={selectedPlayer.teamCode} size={14} />
                          <span>{selectedPlayer.teamCode}</span>
                          <span>·</span>
                          <span>{selectedPlayer.position}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn primary"
                      onClick={() => onPick(selectedPlayer.id)}
                    >
                      Select player
                    </button>
                  </div>

                  <div className="pc-side-section-title">
                    {isWeekOne
                      ? "Last week stats"
                      : `Last week vs ${selectedPlayer.lastWeekOpponentTeam || "-"}`}
                  </div>

                  {isWeekOne ? (
                    <div className="muted">
                      No previous-week stats available for Week 1.
                    </div>
                  ) : (
                    <div className="pc-side-stats pc-side-stats-tight">
                      {weeklyRows.map((row) => (
                        <div
                          key={row.key}
                          className="pc-side-stat-row pc-side-stat-row-tight"
                        >
                          <span>{row.label}</span>
                          <strong>{row.value}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pc-side-card pc-side-card-tight">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <div className="pc-side-section-title" style={{ marginBottom: 0 }}>
                      {selectedPlayer.position === "DEF"
                        ? "Opponent's offense stats"
                        : "Opponent's defense stats"}
                    </div>

                    {!isWeekOne && selectedPlayer.position !== "DEF" && (
                      <div
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 800,
                          letterSpacing: 0.4,
                          textTransform: "uppercase",
                          background: MATCHUP_COLORS[matchupSummary.tone].background,
                          border: `1px solid ${MATCHUP_COLORS[matchupSummary.tone].border}`,
                          color: MATCHUP_COLORS[matchupSummary.tone].text,
                        }}
                      >
                        {matchupSummary.label}
                      </div>
                    )}
                  </div>

                  {isWeekOne ? (
                    <div className="muted">
                      {selectedPlayer.position === "DEF"
                        ? "No opponent offense stats available for Week 1."
                        : "No opponent defense stats available for Week 1."}
                    </div>
                  ) : selectedPlayer.position === "DEF" ? (
                    opponentOffenseStats ? (
                      <>
                        <div
                          className="pc-side-player-meta pc-side-defense-meta"
                          style={{ marginBottom: 12 }}
                        >
                          <TeamLogo team={selectedPlayer.currentWeekOpponentTeam} size={14} />
                          <span>{selectedPlayer.currentWeekOpponentTeam || "-"}</span>
                        </div>

                        <div className="pc-side-stats pc-side-stats-tight">
                          {offenseRows.map((row) => (
                            <div
                              key={row.key}
                              className="pc-side-stat-row pc-side-stat-row-tight"
                            >
                              <span>{row.label}</span>
                              <strong>{row.value}</strong>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="muted">No offense stats available.</div>
                    )
                  ) : opponentDefense ? (
                    <>
                      <div
                        className="pc-side-player-meta pc-side-defense-meta"
                        style={{ marginBottom: 12 }}
                      >
                        <TeamLogo team={opponentDefense.teamCode} size={14} />
                        <span>{opponentDefense.displayName || opponentDefense.teamCode}</span>
                      </div>

                      {highlightHint && (
                        <div
                          style={{
                            marginBottom: 12,
                            padding: "10px 12px",
                            borderRadius: 12,
                            fontSize: 13,
                            fontWeight: 700,
                            background: MATCHUP_COLORS[highlightHint.tone].background,
                            border: `1px solid ${MATCHUP_COLORS[highlightHint.tone].border}`,
                            color: MATCHUP_COLORS[highlightHint.tone].text,
                          }}
                        >
                          {highlightHint.text}
                        </div>
                      )}

                      <div className="pc-side-stats pc-side-stats-tight">
                        {defenseRows.map((row) => {
                          const tone = getMatchupTone(
                            selectedPlayer.position,
                            row.key,
                            row.rawValue
                          );
                          const palette = MATCHUP_COLORS[tone];

                          return (
                            <div
                              key={row.key}
                              className="pc-side-stat-row pc-side-stat-row-tight"
                              style={{
                                padding: "10px 12px",
                                borderRadius: 10,
                                marginBottom: 6,
                                background: palette.background,
                                border: `1px solid ${palette.border}`,
                              }}
                            >
                              <span style={{ color: palette.text }}>{row.label}</span>
                              <strong style={{ color: palette.value }}>{row.value}</strong>
                            </div>
                          );
                        })}
                      </div>

                      <div
                        className="muted"
                        style={{ marginTop: 10, fontSize: 12, lineHeight: 1.45 }}
                      >
                        {matchupSummary.detail}
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