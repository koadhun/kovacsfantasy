/**
 * Közös "elkezdődött-e a meccs" logika a Weekly / Perfect / Playoff zároláshoz.
 *
 * Egy meccs akkor számít elkezdettnek, ha
 *  - a státusza már nem SCHEDULED (IN_PROGRESS, FINAL, ...), VAGY
 *  - a kickoffAt már elmúlt.
 *
 * Így akkor is zár a tippelés, ha a meccs kezdését előrehozták, és a
 * kickoffAt még a régi (későbbi) időpontot tartalmazza.
 */
export function isGameStarted(game, now = new Date()) {
  if (!game) return false;
  if (game.status && game.status !== "SCHEDULED") return true;
  return new Date(game.kickoffAt) <= now;
}
