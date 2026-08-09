// API-Football (american-football.api-sports.io) csapat ID -> a mi rövidítésünk
export const TEAM_CODE_BY_API_ID = {
  1: "LV", 2: "JAX", 3: "NE", 4: "NYG", 5: "BAL", 6: "TEN", 7: "DET", 8: "ATL",
  9: "CLE", 10: "CIN", 11: "ARI", 12: "PHI", 13: "NYJ", 14: "SF", 15: "GB", 16: "CHI",
  17: "KC", 18: "WAS", 19: "CAR", 20: "BUF", 21: "IND", 22: "PIT", 23: "SEA", 24: "TB",
  25: "MIA", 26: "HOU", 27: "NO", 28: "DEN", 29: "DAL", 30: "LAC", 31: "LAR", 32: "MIN",
};

// Statikus NFL konferencia/divízió-besorolás (ritkán változik)
export const TEAM_CONFERENCE_DIVISION = {
  BUF: { conference: "AFC", division: "East" }, MIA: { conference: "AFC", division: "East" },
  NE: { conference: "AFC", division: "East" }, NYJ: { conference: "AFC", division: "East" },
  BAL: { conference: "AFC", division: "North" }, CIN: { conference: "AFC", division: "North" },
  CLE: { conference: "AFC", division: "North" }, PIT: { conference: "AFC", division: "North" },
  HOU: { conference: "AFC", division: "South" }, IND: { conference: "AFC", division: "South" },
  JAX: { conference: "AFC", division: "South" }, TEN: { conference: "AFC", division: "South" },
  DEN: { conference: "AFC", division: "West" }, KC: { conference: "AFC", division: "West" },
  LAC: { conference: "AFC", division: "West" }, LV: { conference: "AFC", division: "West" },
  DAL: { conference: "NFC", division: "East" }, NYG: { conference: "NFC", division: "East" },
  PHI: { conference: "NFC", division: "East" }, WAS: { conference: "NFC", division: "East" },
  CHI: { conference: "NFC", division: "North" }, DET: { conference: "NFC", division: "North" },
  GB: { conference: "NFC", division: "North" }, MIN: { conference: "NFC", division: "North" },
  ATL: { conference: "NFC", division: "South" }, CAR: { conference: "NFC", division: "South" },
  NO: { conference: "NFC", division: "South" }, TB: { conference: "NFC", division: "South" },
  ARI: { conference: "NFC", division: "West" }, LAR: { conference: "NFC", division: "West" },
  SF: { conference: "NFC", division: "West" }, SEA: { conference: "NFC", division: "West" },
};

export function teamCodeFromApiId(apiId) {
  return TEAM_CODE_BY_API_ID[apiId] || null;
}