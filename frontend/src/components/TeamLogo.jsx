import { useMemo, useState } from "react";
import { getTeamLogoUrl, normalizeTeamCode } from "../utils/teams";

export default function TeamLogo({ team, size = 22, className = "", title }) {
  const [broken, setBroken] = useState(false);

  const code = useMemo(() => normalizeTeamCode(team), [team]);
  const src = useMemo(() => getTeamLogoUrl(code, 500), [code]);

  if (!code) return null;

  if (broken || !src) {
    // fallback: rövidítés
    return (
      <span
        className={className}
        title={title || code}
        style={{
          width: size,
          height: size,
          display: "inline-grid",
          placeItems: "center",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,.14)",
          background: "rgba(255,255,255,.04)",
          fontWeight: 900,
          fontSize: Math.max(10, Math.floor(size * 0.42)),
          lineHeight: 1,
        }}
      >
        {code}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={code}
      title={title || code}
      className={className}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
      onError={() => setBroken(true)}
    />
  );
}