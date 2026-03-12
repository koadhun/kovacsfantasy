import { useMemo, useState } from "react";
import TeamLogo from "../TeamLogo";

function prettyLabel(key) {
  return String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (m) => m.toUpperCase())
    .trim();
}

export default function PerfectChallengeCard({
  slot,
  player,
  onSelect,
}) {
  const [flipped, setFlipped] = useState(false);

  const score = useMemo(() => {
    if (!player) return "0.0";
    return Number(player.currentScore || 0).toFixed(1);
  }, [player]);

  const statsRows = useMemo(() => {
    if (!player?.overallStats) return [];
    return Object.entries(player.overallStats);
  }, [player]);

  const displayName = player?.displayName || `${player?.firstName || ""} ${player?.lastName || ""}`.trim();

  return (
    <div className="pc-card-wrap">
      <div className={`pc-card ${flipped ? "is-flipped" : ""}`}>
        <div className="pc-card-face pc-card-front">
          <div className="pc-slot-badge">{slot}</div>

          {player ? (
            <>
              <div className="pc-headshot">
                {player.headshotUrl ? (
                  <img src={player.headshotUrl} alt={displayName} />
                ) : (
                  <div className="pc-headshot-fallback">
                    <TeamLogo team={player.teamCode} size={46} />
                  </div>
                )}
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

              <button
                type="button"
                className="pc-info-btn"
                onClick={() => setFlipped(true)}
                title="Overall stats"
              >
                i
              </button>
            </>
          ) : (
            <>
              <div className="pc-empty-state">
                <div className="pc-empty-title">No player selected</div>
                <div className="pc-empty-sub">Choose a {slot} option for this slot.</div>
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
          <div className="pc-slot-badge">{slot}</div>

          {player ? (
            <>
              <div className="pc-back-title">OVERALL STATS</div>

              <div className="pc-back-player">
                <TeamLogo team={player.teamCode} size={18} />
                <span>{displayName}</span>
              </div>

              <div className="pc-stats-grid">
                {statsRows.map(([key, value]) => (
                  <div key={key} className="pc-stat-row">
                    <span className="pc-stat-label">{prettyLabel(key)}</span>
                    <span className="pc-stat-value">{value}</span>
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
              <div className="pc-empty-title">OVERALL STATS</div>
              <div className="pc-empty-sub">Select a player first.</div>
            </div>
          )}
        </div>
      </div>

      <div className="pc-stats-mini">
        <div className="pc-stats-mini-title">STATS</div>
        {player?.statsSummary ? (
          <>
            <div>{player.statsSummary.line1}</div>
            <div>{player.statsSummary.line2}</div>
            <div>{player.statsSummary.line3}</div>
          </>
        ) : (
          <div>No stats yet.</div>
        )}
      </div>

      <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
        <button className="btn" onClick={onSelect}>
          {player ? "Change player" : "Select player"}
        </button>
      </div>
    </div>
  );
}