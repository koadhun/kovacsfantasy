import { useEffect, useState } from "react";
import TeamLogo from "../TeamLogo";

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
        <TeamLogo team={player.teamCode} size={34} />
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
}) {
  if (!open) return null;

  return (
    <div className="pc-modal-backdrop" onClick={onClose}>
      <div className="pc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pc-modal-head">
          <div>
            <div className="pc-modal-kicker">Perfect Challenge</div>
            <h3 style={{ margin: "6px 0 0 0" }}>{title}</h3>
          </div>

          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="pc-modal-list">
          {players.map((player) => {
            const displayName =
              player.displayName || `${player.firstName} ${player.lastName}`;

            return (
              <button
                key={player.id}
                type="button"
                className="pc-player-option"
                onClick={() => onPick(player.id)}
              >
                <div className="pc-player-option-left">
                  <PlayerOptionImage player={player} displayName={displayName} />

                  <div>
                    <div className="pc-player-option-name">{displayName}</div>
                    <div className="pc-player-option-meta">
                      <TeamLogo team={player.teamCode} size={16} />
                      <span>{player.teamCode}</span>
                      <span>·</span>
                      <span>{player.position}</span>
                    </div>
                  </div>
                </div>

                <div className="pc-player-option-right">
                  <div className="pc-player-option-score">
                    {Number(player.currentScore || 0).toFixed(1)}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
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
    </div>
  );
}