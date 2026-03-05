export const TEAM_LOGO = {
    ARI: "ari",
    ATL: "atl",
    BAL: "bal",
    BUF: "buf",
    CAR: "car",
    CHI: "chi",
    CIN: "cin",
    CLE: "cle",
    DAL: "dal",
    DEN: "den",
    DET: "det",
    GB: "gb",
    HOU: "hou",
    IND: "ind",
    JAX: "jax",
    KC: "kc",
    LV: "lv",
    LAC: "lac",
    LAR: "lar",
    MIA: "mia",
    MIN: "min",
    NE: "ne",
    NO: "no",
    NYG: "nyg",
    NYJ: "nyj",
    PHI: "phi",
    PIT: "pit",
    SF: "sf",
    SEA: "sea",
    TB: "tb",
    TEN: "ten",
    WAS: "wsh",
  };
  
  export function teamLogoUrl(abbr, size = 100) {
    const key = TEAM_LOGO[abbr];
    if (!key) return null;
    return `https://a.espncdn.com/i/teamlogos/nfl/${size}/${key}.png`;
  }