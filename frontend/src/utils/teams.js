import { teamLogoUrl } from "./teamLogos";

// Régi/alternatív csapatkódok normalizálása a jelenlegi rövidítésekre
const TEAM_CODE_ALIASES = {
  WSH: "WAS",
  JAC: "JAX",
  OAK: "LV",
  SD: "LAC",
  STL: "LAR",
  LA: "LAR",
};

export function normalizeTeamCode(team) {
  if (!team) return null;
  let code = String(team).trim().toUpperCase();
  if (TEAM_CODE_ALIASES[code]) {
    code = TEAM_CODE_ALIASES[code];
  }
  return code;
}

export function getTeamLogoUrl(code, size = 100) {
  if (!code) return null;
  return teamLogoUrl(code, size);
}