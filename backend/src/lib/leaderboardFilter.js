/**
 * Ranglisták (Weekly Pick'Em, Perfect Challenge, Playoff Challenge) közös szűrése:
 * csak azok a felhasználók szerepelnek, akiknek legalább ennyi pontjuk van.
 * Ha a szabály változik (pl. már a 0-nál nagyobb pont is elég), elég ezt az egy értéket átírni.
 */
export const MIN_LEADERBOARD_POINTS = 1;

export function hasLeaderboardPoints(points) {
  return Number(points) >= MIN_LEADERBOARD_POINTS;
}
