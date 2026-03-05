import { useMemo, useState } from "react";

const BASE = "https://static.www.nfl.com/league/api/clubs/logos";

function normalizeTeam(team) {
  return String(team || "").trim().toUpperCase();
}

export default function TeamLogo({ team, size = 22, className = "" }) {
  const [broken, setBroken] = useState(false);

  const t = useMemo(() => normalizeTeam(team), [team]);
  const src = useMemo(() => `${BASE}/${t}.svg`, [t]);

  if (!t) return null;

  if (broken) {
    // fallback: ha valamiért nem jön le a logo (offline/CORS/hibás team code)
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          border: "1px solid rgba(255,255,255,.14)",
          background: "rgba(255,255,255,.06)",
          fontWeight: 900,
          fontSize: Math.max(10, Math.round(size * 0.38)),
          letterSpacing: 0.6,
        }}
        title={t}
      >
        {t}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${t} logo`}
      width={size}
      height={size}
      className={className}
      style={{ display: "block" }}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}