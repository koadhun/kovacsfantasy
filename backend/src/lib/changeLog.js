import { prisma } from "./prisma.js";

/**
 * Változásnapló a három fantasy játékhoz.
 * Egy sor = egy felhasználói módosítás: ki, mikor, mit, miről mire.
 *
 * A naplózás SOSEM akadályozhatja a tipp / slot mentését: minden hiba csak
 * a szerver logjába kerül.
 */

export const CHANGE_GAME = {
  PICKEM: "PICKEM",
  PERFECT: "PERFECT",
  PLAYOFF: "PLAYOFF",
};

/**
 * Játékos olvasható neve a naplóhoz, pl. "Josh Allen (BUF)".
 * A név szövegként kerül a naplóba, így akkor is olvasható marad, ha a játékos
 * sora később törlődik vagy lecserélődik (pl. Excel-importált játékosok).
 */
export function playerLabel(player) {
  if (!player) return null;

  const name =
    player.displayName ||
    `${player.firstName || ""} ${player.lastName || ""}`.trim() ||
    String(player.id || "?");

  return player.teamCode ? `${name} (${player.teamCode})` : name;
}

/**
 * @param {object} entry
 * @param {string} entry.userId
 * @param {string} [entry.username]  ha nincs megadva, az adatbázisból kérdezi le
 * @param {"PICKEM"|"PERFECT"|"PLAYOFF"} entry.game
 * @param {number} entry.season
 * @param {number} [entry.week]      Pick'Em / Perfect
 * @param {string} [entry.round]     Playoff (WILDCARD, DIVISIONAL, ...)
 * @param {string} entry.target      mire vonatkozik (pl. "NYG @ PHI" vagy "QB")
 * @param {string} [entry.targetId]  meccs id / slot
 * @param {string|null} [entry.previousValue]  korábbi érték olvasható formában
 * @param {string|null} [entry.previousId]
 * @param {string} entry.newValue
 * @param {string} [entry.newId]
 * @param {object} [entry.meta]
 */
export async function logChange(entry) {
  try {
    const previousKey = entry.previousId ?? entry.previousValue ?? null;
    const newKey = entry.newId ?? entry.newValue ?? null;

    // Ha nem változott semmi (ugyanazt választotta újra), nincs mit naplózni.
    if (previousKey !== null && previousKey === newKey) return null;

    let username = entry.username;
    if (!username) {
      const user = await prisma.user.findUnique({
        where: { id: entry.userId },
        select: { username: true },
      });
      username = user?.username || "?";
    }

    return await prisma.fantasyChangeLog.create({
      data: {
        userId: String(entry.userId),
        username,
        game: entry.game,
        season: Number(entry.season),
        week: entry.week != null ? Number(entry.week) : null,
        round: entry.round ?? null,
        target: entry.target,
        targetId: entry.targetId != null ? String(entry.targetId) : null,
        previousValue: entry.previousValue ?? null,
        previousId: entry.previousId != null ? String(entry.previousId) : null,
        newValue: entry.newValue,
        newId: entry.newId != null ? String(entry.newId) : null,
        meta: entry.meta ?? undefined,
      },
    });
  } catch (err) {
    console.error("[change-log] Naplóírási hiba:", err);
    return null;
  }
}
