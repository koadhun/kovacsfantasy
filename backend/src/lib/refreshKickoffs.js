import { prisma } from "./prisma.js";
import { ACTIVE_GAME_TYPE, ACTIVE_STAGE_NAME } from "./activeGameType.js";

/**
 * Az API aktuális kezdési időpontja alapján frissíti a Game.kickoffAt mezőt
 * minden még nem lejátszott meccsnél (ha a liga áttesz egy meccset, a cron
 * 30 percen belül átvezeti).
 *
 * @param {number} season
 * @param {Array} apiGames a /games?league=1&season=... válasz "response" tömbje
 * @returns {Promise<number>} hány meccs kezdési ideje változott
 */
export async function refreshKickoffTimes(season, apiGames) {
  const dbGames = await prisma.game.findMany({
    where: {
      season,
      gameType: ACTIVE_GAME_TYPE,
      status: { not: "FINAL" },
      apiGameId: { not: null },
    },
    select: { id: true, apiGameId: true, kickoffAt: true, homeTeam: true, awayTeam: true, week: true },
  });

  const byApiId = new Map(dbGames.map((g) => [g.apiGameId, g]));
  const updates = [];

  for (const apiGame of apiGames) {
    if (apiGame.game?.stage !== ACTIVE_STAGE_NAME) continue;

    const existing = byApiId.get(apiGame.game.id);
    if (!existing) continue;

    const ts = Number(apiGame.game?.date?.timestamp);
    if (!Number.isFinite(ts) || ts <= 0) continue;

    const next = new Date(ts * 1000);
    if (next.getTime() === new Date(existing.kickoffAt).getTime()) continue;

    console.log(
      `[live-sync] Kezdési idő változott: W${existing.week} ${existing.awayTeam}@${existing.homeTeam} ` +
        `${new Date(existing.kickoffAt).toISOString()} -> ${next.toISOString()}`
    );

    updates.push(
      prisma.game.update({ where: { id: existing.id }, data: { kickoffAt: next } })
    );
  }

  await Promise.all(updates);
  return updates.length;
}
