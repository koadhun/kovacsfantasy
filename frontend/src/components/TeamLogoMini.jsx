import React from "react";

const TEAM_STYLE = {
  LAR: { a: "#003594", b: "#FFD100" },
  DET: { a: "#0076B6", b: "#B0B7BC" },
  KC: { a: "#E31837", b: "#FFB81C" },
  SF: { a: "#AA0000", b: "#B3995D" },
  PHI: { a: "#004C54", b: "#A5ACAF" },
  DAL: { a: "#003594", b: "#869397" },
  // ide szépen bővíthetjük: NE, BUF, MIA, NYJ, stb.
};

export default function TeamLogoMini({ team, fallbackText = "—", title }) {
  const code = (team || "").toUpperCase();
  const colors = TEAM_STYLE[code] || { a: "#1E293B", b: "#60A5FA" };

  // egyszerű, modern “badge” (nem hivatalos logo)
  return (
    <div
      className="teamLogoMini"
      title={title || code || fallbackText}
      aria-label={code || fallbackText}
      style={{
        background: `linear-gradient(135deg, ${colors.a}, ${colors.b})`
      }}
    >
      <span className="teamLogoMiniText">{code || fallbackText}</span>
    </div>
  );
}