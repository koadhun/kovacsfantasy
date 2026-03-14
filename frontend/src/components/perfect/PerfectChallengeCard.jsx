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

const DECIMAL_KEYS = new Set(["passingYards", "rushingYards", "receivedYards"]);

const STAT_ORDER_BY_POSITION = {
  QB: ["passingYards", "passingTDs", "interceptions", "rushingYards", "rushingTDs", "fumble"],
  RB: ["rushingYards", "rushingTDs", "receivedYards", "receivedTDs", "fumble"],
  WR: ["receivedYards", "receivedTDs", "rushingYards", "rushingTDs", "fumbles"],
  TE: ["receivedYards", "receivedTDs", "rushingYards", "rushingTDs", "fumbles"],
  K: ["fg0to49Yards", "fg50plusYards", "xp"],
  DEF: ["interception", "forcedFumble", "sack", "safety", "returnTD", "allowedPoints"],
};

const BREAKDOWN_ORDER_BY_POSITION = {
  QB: ["passingYards", "passingTDs", "interceptions", "rushingYards", "rushingTDs", "fumble"],
  RB: ["rushingYards", "rushingTDs", "receivedYards", "receivedTDs", "fumble"],
  WR: ["receivedYards", "receivedTDs", "rushingYards", "rushingTDs", "fumbles"],
  TE: ["receivedYards", "receivedTDs", "rushingYards", "rushingTDs", "fumbles"],
  K: ["fg0to49Yards", "fg50plusYards", "xp"],
  DEF: ["base", "interception", "forcedFumble", "sack", "safety", "returnTD", "allowedPointsPenalty"],
};

function formatStatValue(key, value) {
  if (value == null) return "-";
  if (DECIMAL_KEYS.has(key)) return Number(value).toFixed(1);
  return value;
}

function formatBreakdownValue(value) {
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
    value: formatBreakdownValue(breakdown[key]),
  }));
}

function getDisplayName(player) {
  return player?.displayName || `${player?.firstName || ""} ${player?.lastName || ""}`.trim();
}

export default function PerfectChallengeCard({
  slot,
  player,
  onSelect,
  readOnly = false,
  hidden = false,
}) {
  const [flipped, setFlipped] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [backView, setBackView] = useState("stats");
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setImgFailed(false);
    setBackView("stats");
    setFlipped(false);
    setHovered(false);
  }, [player?.id, slot, hidden]);

  const weeklyRows = useMemo(
    () => orderedStatRows(player?.position, player?.weeklyStats),
    [player]
  );

  const breakdownRows = useMemo(
    () => orderedBreakdownRows(player?.position, player?.weeklyScoreBreakdown?.breakdown),
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

  return (
    <div className="pc-card-wrap">
      <div className={`pc-card ${flipped ? "is-flipped" : ""}`}>
        <div className="pc-card-face pc-card-front">
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              minHeight: 0,
              padding: "12px 12px 14px",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                zIndex: 5,
              }}
            >
              <div
                className="pc-slot-badge"
                style={{
                  minWidth: 46,
                  height: 31,
                  padding: "0 13px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: ".03em",
                }}
              >
                {slot}
              </div>
            </div>

            {hidden ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "18px 14px 26px",
                }}
              >
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(255,255,255,.08)",
                    fontSize: 28,
                    marginBottom: 16,
                  }}
                >
                  🔒
                </div>

                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#f2f5ff",
                    marginBottom: 10,
                  }}
                >
                  Pick hidden
                </div>

                <div
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,.72)",
                    maxWidth: 220,
                    lineHeight: 1.4,
                  }}
                >
                  This player's game has not started yet. The pick becomes visible after kickoff.
                </div>
              </div>
            ) : player ? (
              <>
                <div
                  style={{
                    flex: 1,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    paddingTop: 26,
                    paddingBottom: 64,
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: 132,
                      height: 132,
                      borderRadius: 22,
                      overflow: "hidden",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                      marginBottom: 12,
                      flexShrink: 0,
                    }}
                    onMouseEnter={() => !readOnly && setHovered(true)}
                    onMouseLeave={() => !readOnly && setHovered(false)}
                  >
                    {showHeadshot ? (
                      <img
                        src={player.headshotUrl}
                        alt={displayName}
                        onError={() => setImgFailed(true)}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <TeamLogo team={player.teamCode} size={72} />
                      </div>
                    )}

                    {!readOnly ? (
                      <>
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: hovered
                              ? "linear-gradient(180deg, rgba(2,6,23,0.08), rgba(2,6,23,0.58))"
                              : "transparent",
                            transition: "0.18s ease",
                          }}
                        />

                        <button
                          type="button"
                          onClick={onSelect}
                          style={{
                            position: "absolute",
                            left: "50%",
                            bottom: 10,
                            transform: hovered
                              ? "translateX(-50%) translateY(0)"
                              : "translateX(-50%) translateY(8px)",
                            opacity: hovered ? 1 : 0,
                            pointerEvents: hovered ? "auto" : "none",
                            transition: "all 0.18s ease",
                            border: "1px solid rgba(59,130,246,.55)",
                            background: "rgba(8,18,44,.95)",
                            color: "#fff",
                            borderRadius: 10,
                            padding: "8px 12px",
                            fontSize: 12,
                            fontWeight: 800,
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                          }}
                        >
                          Change player
                        </button>
                      </>
                    ) : null}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "rgba(255,255,255,.78)",
                      flexShrink: 0,
                    }}
                  >
                    <TeamLogo team={player.teamCode} size={14} />
                    <span>{player.teamCode}</span>
                  </div>

                  <div style={{ lineHeight: 1.02, flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: "rgba(255,255,255,.92)",
                      }}
                    >
                      {player.firstName}
                    </div>
                    <div
                      style={{
                        fontSize: 31,
                        fontWeight: 900,
                        color: "#f8fbff",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {player.lastName}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: 18,
                    transform: "translateX(-50%)",
                    fontSize: 34,
                    fontWeight: 900,
                    lineHeight: 1,
                    color: "#f8fbff",
                    zIndex: 3,
                    pointerEvents: "none",
                  }}
                >
                  {score}
                </div>

                <button
                  type="button"
                  onClick={() => setFlipped(true)}
                  title="Weekly details"
                  style={{
                    position: "absolute",
                    right: 14,
                    bottom: 14,
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,.14)",
                    background: "rgba(255,255,255,.06)",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 800,
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    zIndex: 5,
                  }}
                >
                  i
                </button>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "18px 14px 26px",
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
                    maxWidth: 220,
                  }}
                >
                  {readOnly
                    ? `No ${slot} player visible for this slot.`
                    : `Choose a ${slot} player for this slot.`}
                </div>

                {!readOnly ? (
                  <button className="btn primary" onClick={onSelect}>
                    Select player
                  </button>
                ) : null}
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
              padding: "10px 14px 10px",
              overflow: "hidden",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {hidden ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  color: "rgba(255,255,255,.74)",
                  padding: 20,
                  lineHeight: 1.45,
                }}
              >
                Pick hidden until kickoff.
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <div
                    className="pc-slot-badge"
                    style={{
                      paddingInline: 14,
                      minWidth: "unset",
                      fontSize: 12,
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
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,.14)",
                      background: "rgba(255,255,255,.06)",
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    ↺
                  </button>
                </div>

                {player ? (
                  <>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#f3f6ff",
                        marginBottom: 6,
                        lineHeight: 1.1,
                      }}
                    >
                      {displayName}
                    </div>

                    <div
                      style={{
                        display: "inline-flex",
                        gap: 8,
                        marginBottom: 6,
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
                          padding: "6px 12px",
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
                          padding: "6px 12px",
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
                        flex: 1,
                        overflow: "hidden",
                      }}
                    >
                      {(backView === "stats" ? weeklyRows : breakdownRows).map((row) => (
                        <div
                          key={row.key}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(0,1fr) auto",
                            alignItems: "center",
                            gap: 10,
                            padding: "4px 0",
                            borderBottom: "1px solid rgba(255,255,255,.08)",
                            fontSize: 12,
                            lineHeight: 1.05,
                          }}
                        >
                          <span style={{ color: "rgba(255,255,255,.84)" }}>
                            {row.label}
                          </span>
                          <strong style={{ color: "#fff", fontSize: 12 }}>
                            {row.value}
                          </strong>
                        </div>
                      ))}

                      {backView === "points" ? (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(0,1fr) auto",
                            alignItems: "center",
                            gap: 10,
                            paddingTop: 5,
                            marginTop: 2,
                            fontSize: 13,
                            fontWeight: 900,
                            lineHeight: 1.05,
                          }}
                        >
                          <span style={{ color: "#fff" }}>Total</span>
                          <strong style={{ color: "#fff" }}>{breakdownTotal}</strong>
                        </div>
                      ) : null}
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
                    }}
                  >
                    Select a player first.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}