import { useEffect, useMemo, useState } from "react";
import TeamLogo from "../TeamLogo";
import { useLanguage } from "../../i18n/LanguageContext";

const INJURY_COLORS = {
  Out: { bg: "rgba(239,68,68,.18)", text: "#fca5a5" },
  Doubtful: { bg: "rgba(249,115,22,.18)", text: "#fdba74" },
  Questionable: { bg: "rgba(234,179,8,.18)", text: "#fde047" },
  "I.L.": { bg: "rgba(148,163,184,.18)", text: "#cbd5e1" },
};

function injuryLabel(status) {
  if (status === "Questionable") return "Q";
  if (status === "Doubtful") return "D";
  if (status === "Out") return "OUT";
  return status;
}

function InjuryBadge({ injury }) {
  if (!injury) return null;
  const c = INJURY_COLORS[injury.status] || INJURY_COLORS["I.L."];

  return (
    <span
      style={{
        marginLeft: 6,
        padding: "2px 7px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 900,
        background: c.bg,
        color: c.text,
        whiteSpace: "nowrap",
      }}
    >
      {injuryLabel(injury.status)}
    </span>
  );
}

const PLAYER_STAT_ORDER_BY_POSITION = {
  QB: ["passingYards", "passingTDs", "interceptions", "rushingYards", "rushingTDs", "fumble"],
  RB: ["rushingYards", "rushingTDs", "receivedYards", "receivedTDs", "fumble"],
  WR: ["receivedYards", "receivedTDs", "rushingYards", "rushingTDs", "fumbles"],
  TE: ["receivedYards", "receivedTDs", "rushingYards", "rushingTDs", "fumbles"],
  K: ["fg0to49Yards", "fg50plusYards", "xp"],
  DEF: ["interception", "forcedFumble", "sack", "safety", "returnTD", "allowedPoints"],
};

const DEFENSE_STAT_ORDER = [
  "allowedPassingYards",
  "allowedRushingYards",
  "interceptions",
  "fumbles",
  "sacks",
  "returnTDs",
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

function formatValue(key, value) {
  if (value == null) return "-";
  if (DECIMAL_KEYS.has(key)) return Number(value).toFixed(1);
  return value;
}

function getDisplayName(player) {
  return player?.displayName || `${player?.firstName || ""} ${player?.lastName || ""}`.trim();
}

function buildPlayerWeeklyRows(player, t) {
  if (!player) return [];
  const order = PLAYER_STAT_ORDER_BY_POSITION[player.position] || [];

  return order.map((key) => ({
    key,
    label: t(`perfectChallengeCard.statLabels.${key}`) || key,
    value: formatValue(key, player.weeklyStats?.[key]),
  }));
}

function buildDefenseRows(defenseStats, t) {
  if (!defenseStats) return [];
  return DEFENSE_STAT_ORDER.map((key) => ({
    key,
    label: t(`perfectChallengeSelectorModal.defenseLabels.${key}`) || key,
    value: formatValue(key, defenseStats[key]),
  }));
}

function buildOffenseRows(offenseStats, t) {
  if (!offenseStats) return [];
  return OFFENSE_STAT_ORDER.map((key) => ({
    key,
    label: t(`perfectChallengeSelectorModal.offenseLabels.${key}`) || key,
    value: formatValue(key, offenseStats[key]),
  }));
}

function isFirstPeriod(player, periodType) {
  if (!player) return false;

  if (periodType === "round") {
    return String(player.round || "") === "WILDCARD";
  }

  return Number(player.week) === 1;
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
  onClose,
  onPick,
  modeLabel = "Perfect Challenge",
  periodType = "week",
}) {
  const { t } = useLanguage();
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const userRole = currentUser?.role || "USER";
  const hasFullAccess = userRole === "VIP" || userRole === "ADMIN";

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

  const initialPeriod = useMemo(
    () => isFirstPeriod(selectedPlayer, periodType),
    [selectedPlayer, periodType]
  );

  const weeklyRows = useMemo(() => {
    if (!selectedPlayer) return [];
    return buildPlayerWeeklyRows(selectedPlayer, t);
  }, [selectedPlayer, t]);

  const defenseRows = useMemo(() => {
    if (!selectedPlayer || initialPeriod || selectedPlayer.position === "DEF") return [];
    return buildDefenseRows(selectedPlayer.currentWeekOpponentDefenseStats, t);
  }, [selectedPlayer, initialPeriod, t]);

  const offenseRows = useMemo(() => {
    if (!selectedPlayer || initialPeriod || selectedPlayer.position !== "DEF") return [];
    return buildOffenseRows(selectedPlayer.currentWeekOpponentOffenseStats, t);
  }, [selectedPlayer, initialPeriod, t]);

  const previousStatsTitle =
    periodType === "round"
      ? initialPeriod
        ? t("perfectChallengeSelectorModal.previousRoundStats")
        : `${t("perfectChallengeSelectorModal.previousRoundVs")} ${selectedPlayer?.lastWeekOpponentTeam || "-"}`
      : initialPeriod
        ? t("perfectChallengeSelectorModal.lastWeekStats")
        : `${t("perfectChallengeSelectorModal.lastWeekVs")} ${selectedPlayer?.lastWeekOpponentTeam || "-"}`;

  const noPreviousPlayerText =
    periodType === "round"
      ? t("perfectChallengeSelectorModal.noPreviousRoundStats")
      : t("perfectChallengeSelectorModal.noPreviousWeekStats");

  const noPreviousDefenseText =
    periodType === "round"
      ? selectedPlayer?.position === "DEF"
        ? t("perfectChallengeSelectorModal.noPreviousRoundOffense")
        : t("perfectChallengeSelectorModal.noPreviousRoundDefense")
      : selectedPlayer?.position === "DEF"
        ? t("perfectChallengeSelectorModal.noPreviousWeekOffense")
        : t("perfectChallengeSelectorModal.noPreviousWeekDefense");

  if (!open) return null;

  return (
    <div className="pc-modal-backdrop" onClick={onClose}>
      <div
        className="pc-modal pc-modal-wide pc-modal-tight"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pc-modal-head pc-modal-head-tight">
          <div>
            <div className="pc-modal-kicker">{modeLabel}</div>
            <h3 style={{ margin: "4px 0 0 0" }}>{title}</h3>
          </div>

          <button className="btn" onClick={onClose}>
            {t("perfectChallengeSelectorModal.close")}
          </button>
        </div>

        <div
          className="pc-picker-layout pc-picker-layout-tight"
          style={!hasFullAccess ? { display: "block" } : undefined}
        >
          <div
            className="pc-picker-left"
            style={!hasFullAccess ? { width: "100%" } : undefined}
          >
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                className="input"
                placeholder={t("perfectChallengeSelectorModal.searchPlaceholder")}
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
                  <div
                    key={player.id}
                    className={`pc-player-option ${
                      hasFullAccess && selectedPlayerId === player.id ? "active" : ""
                    }`}
                    onClick={hasFullAccess ? () => setSelectedPlayerId(player.id) : undefined}
                    style={hasFullAccess ? { cursor: "pointer" } : undefined}
                  >
                    <div className="pc-player-option-left">
                      <PlayerOptionImage player={player} displayName={displayName} />

                      <div>
                        <div className="pc-player-option-name">
                          {displayName}
                          {hasFullAccess && <InjuryBadge injury={player.injury} />}
                        </div>

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
                          {t("perfectChallengeSelectorModal.vs")} {player.currentWeekOpponentTeam || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="pc-player-option-right">
                      <div className="pc-player-option-score">
                        {Number(player.avgScore || 0).toFixed(1)}
                      </div>
                      <div className="muted" style={{ fontSize: 11 }}>
                        {t("perfectChallengeSelectorModal.points")}
                      </div>

                      {!hasFullAccess && (
                        <button
                          type="button"
                          className="btn primary"
                          style={{ marginTop: 8 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onPick(player.id);
                          }}
                        >
                          {t("perfectChallengeSelectorModal.selectPlayer")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {!filteredPlayers.length && players.length > 0 && (
                <div className="muted">{t("perfectChallengeSelectorModal.noPlayersFound")} "{searchTerm}".</div>
              )}

              {!players.length && (
                <div className="muted">{t("perfectChallengeSelectorModal.noPlayersAvailable")}</div>
              )}
            </div>
          </div>

          {hasFullAccess && (
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
                          <InjuryBadge injury={selectedPlayer.injury} />
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
                      {t("perfectChallengeSelectorModal.selectPlayer")}
                    </button>
                  </div>
                </div>

                {selectedPlayer.injury && (
                  <div className="pc-side-card pc-side-card-tight">
                    <div className="pc-side-section-title" style={{ marginBottom: 10 }}>
                      {t("perfectChallengeSelectorModal.injuryReportTitle")}
                    </div>

                    <div className="pc-side-stats pc-side-stats-tight">
                      <div className="pc-side-stat-row pc-side-stat-row-tight">
                        <span>{t("perfectChallengeSelectorModal.statusLabel")}</span>
                        <strong
                          style={{
                            color:
                              (INJURY_COLORS[selectedPlayer.injury.status] ||
                                INJURY_COLORS["I.L."]).text,
                          }}
                        >
                          {selectedPlayer.injury.status.toUpperCase()}
                        </strong>
                      </div>
                    </div>

                    <div
                      className="muted"
                      style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}
                    >
                      {selectedPlayer.injury.description}
                    </div>
                  </div>
                )}

                <div className="pc-side-card pc-side-card-tight">
                  <div className="pc-side-section-title">{previousStatsTitle}</div>

                  {initialPeriod ? (
                    <div className="muted">{noPreviousPlayerText}</div>
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
                  <div className="pc-side-section-title" style={{ marginBottom: 10 }}>
                    {selectedPlayer.position === "DEF"
                      ? t("perfectChallengeSelectorModal.opponentOffenseStats")
                      : t("perfectChallengeSelectorModal.opponentDefenseStats")}
                  </div>

                  {initialPeriod ? (
                    <div className="muted">{noPreviousDefenseText}</div>
                  ) : selectedPlayer.position === "DEF" ? (
                    selectedPlayer.currentWeekOpponentOffenseStats ? (
                      <>
                        <div
                          style={{
                            marginBottom: 12,
                            fontSize: 14,
                            fontWeight: 800,
                            color: "rgba(255,255,255,.86)",
                            lineHeight: 1.2,
                          }}
                        >
                          {selectedPlayer.currentWeekOpponentTeam || "-"}
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
                      <div className="muted">{t("perfectChallengeSelectorModal.noOffenseStats")}</div>
                    )
                  ) : selectedPlayer.currentWeekOpponentDefenseStats ? (
                    <>
                      <div
                        style={{
                          marginBottom: 12,
                          fontSize: 14,
                          fontWeight: 800,
                          color: "rgba(255,255,255,.86)",
                          lineHeight: 1.2,
                        }}
                      >
                        {selectedPlayer.currentWeekOpponentTeam || "-"}
                      </div>

                      <div className="pc-side-stats pc-side-stats-tight">
                        {defenseRows.map((row) => (
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
                    <div className="muted">{t("perfectChallengeSelectorModal.noDefenseStats")}</div>
                  )}
                </div>
              </>
            ) : (
              <div className="pc-side-card pc-side-card-tight">
                <div className="muted">{t("perfectChallengeSelectorModal.selectFromLeft")}</div>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
