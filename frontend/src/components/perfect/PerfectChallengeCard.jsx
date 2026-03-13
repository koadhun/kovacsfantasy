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

function formatBreakdownValue(_key, value) {
  if (value == null) return "-";
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

function getDisplayName(player) {
  return (
    player?.displayName ||
    `${player?.firstName || ""} ${player?.lastName || ""}`.trim()
  );
}

export default function PerfectChallengeCard({ slot, player, onSelect }) {
  const [flipped, setFlipped] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [backView, setBackView] = useState("stats");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setImgFailed(false);
    setBackView("stats");
    setFlipped(false);
    setIsHovered(false);
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

  const displayName = getDisplayName(player);
  const showHeadshot = !!player?.headshotUrl && !imgFailed;

  function handleImgError() {
    setImgFailed(true);
  }

  return (
    <div className="pc-card-wrap">
      <div
        className={`pc-card ${flipped ? "is-flipped" : ""}`}
        style={{ minHeight: 400 }}
      >
        <div className="pc-card-face pc-card-front">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              minHeight: "100%",
              flexDirection: "column",
            }}
          >
            <div className="pc-slot-badge">{slot}</div>

            {player ? (
              <>
                <div
                  style={{
                    width: "100%",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "12px 8px 20px",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: 132,
                      height: 132,
                      borderRadius: 18,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                      overflow: "hidden",
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    {showHeadshot ? (
                      <img
                        src={player.headshotUrl}
                        alt={displayName}
                        onError={handleImgError}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <TeamLogo team={player.teamCode} size={72} />
                    )}

                    <button
                      type="button"
                      onClick={onSelect}
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: 10,
                        transform: `translateX(-50%) ${
                          isHovered ? "translateY(0)" : "translateY(8px)"
                        }`,
                        opacity: isHovered ? 1 : 0,
                        pointerEvents: isHovered ? "auto" : "none",
                        transition: "all 0.18s ease",
                        border: "1px solid rgba(59,130,246,.65)",
                        background: "rgba(8,19,48,.92)",
                        color: "#fff",
                        borderRadius: 10,
                        padding: "8px 12px",
                        fontSize: 13,
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                        boxShadow: "0 8px 18px rgba(0,0,0,.28)",
                        cursor: "pointer",
                      }}
                    >
                      Change player
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "rgba(255,255,255,.78)",
                    }}
                  >
                    <TeamLogo team={player.teamCode} size={15} />
                    <span>{player.teamCode}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      lineHeight: 1.02,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "rgba(255,255,255,.9)",
                      }}
                    >
                      {player.firstName}
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 900,
                        color: "#f3f6ff",
                      }}
                    >
                      {player.lastName}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 900,
                      lineHeight: 1,
                      color: "#f8fbff",
                    }}
                  >
                    {score}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFlipped(true)}
                  title="Weekly details"
                  style={{
                    position: "absolute",
                    right: 12,
                    bottom: 12,
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,.14)",
                    background: "rgba(255,255,255,.06)",
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  i
                </button>
              </>
            ) : (
              <div
                style={{
                  width: "100%",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "28px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 900,
                    color: "#f2f5ff",
                    marginBottom: 10,
                  }}
                >
                  No player selected
                </div>

                <div
                  style={{
                    fontSize: 15,
                    color: "rgba(255,255,255,.72)",
                    marginBottom: 18,
                  }}
                >
                  Choose a {slot} player for this slot.
                </div>

                <button className="btn primary" onClick={onSelect}>
                  Select player
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pc-card-face pc-card-back">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              padding: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                className="pc-slot-badge"
                style={{
                  minWidth: "unset",
                  paddingInline: 14,
                  borderRadius: 999,
                  fontSize: 12,
                  letterSpacing: ".05em",
                }}
              >
                {slot} · {backView === "stats" ? "WEEKLY STATS" : "FANTASY POINTS"}
              </div>

              <button
                type="button"
                onClick={() => setFlipped(false)}
                title="Back"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,.14)",
                  background: "rgba(255,255,255,.06)",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                ↺
              </button>
            </div>

            {player ? (
              <>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#f3f6ff",
                    marginBottom: 10,
                  }}
                >
                  {displayName}
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setBackView("stats")}
                    style={{
                      border: "1px solid rgba(255,255,255,.12)",
                      background:
                        backView === "stats"
                          ? "rgba(59,130,246,.22)"
                          : "rgba(255,255,255,.06)",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "7px 12px",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Stats
                  </button>

                  <button
                    type="button"
                    onClick={() => setBackView("points")}
                    style={{
                      border: "1px solid rgba(255,255,255,.12)",
                      background:
                        backView === "points"
                          ? "rgba(59,130,246,.22)"
                          : "rgba(255,255,255,.06)",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "7px 12px",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Points
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    overflow: "auto",
                    paddingRight: 2,
                  }}
                >
                  {backView === "stats" ? (
                    weeklyRows.map((row) => (
                      <div
                        key={row.key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                          padding: "9px 0",
                          borderBottom: "1px solid rgba(255,255,255,.08)",
                          fontSize: 15,
                        }}
                      >
                        <span style={{ color: "rgba(255,255,255,.84)" }}>
                          {row.label}
                        </span>
                        <strong style={{ color: "#fff", fontSize: 15 }}>
                          {row.value}
                        </strong>
                      </div>
                    ))
                  ) : (
                    <>
                      {breakdownRows.map((row) => (
                        <div
                          key={row.key}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            padding: "9px 0",
                            borderBottom: "1px solid rgba(255,255,255,.08)",
                            fontSize: 15,
                          }}
                        >
                          <span style={{ color: "rgba(255,255,255,.84)" }}>
                            {row.label}
                          </span>
                          <strong style={{ color: "#fff", fontSize: 15 }}>
                            {row.value}
                          </strong>
                        </div>
                      ))}

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                          paddingTop: 12,
                          marginTop: 6,
                          fontSize: 16,
                          fontWeight: 900,
                        }}
                      >
                        <span style={{ color: "#fff" }}>Total</span>
                        <strong style={{ color: "#fff" }}>{breakdownTotal}</strong>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,.72)",
                  textAlign: "center",
                  padding: 20,
                }}
              >
                Select a player first.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}