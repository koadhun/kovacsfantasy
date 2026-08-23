import { prisma } from "./prisma.js";

// A hét "aktuálisnak" számít az utolsó (legkésőbb kezdődő) mérkőzésének
// kickoffja után még ennyi óráig. Hétfő esti meccs -> kedd hajnal (HU idő)
// -> +42 óra -> kedd kora este vált át a következő hétre.
const CUTOFF_HOURS_AFTER_LAST_GAME = 42;

export async function getCurrentWeek(season, gameType = "REG") {
  const games = await prisma.game.findMany({
    where: { season: Number(season), gameType },
    select: { week: true, kickoffAt: true },
  });

  if (!games.length) return 1;

  const maxKickoffByWeek = new Map();
  for (const g of games) {
    if (g.week == null || !g.kickoffAt) continue;
    const t = new Date(g.kickoffAt).getTime();
    const current = maxKickoffByWeek.get(g.week);
    if (current == null || t > current) {
      maxKickoffByWeek.set(g.week, t);
    }
  }

  const weeks = [...maxKickoffByWeek.keys()].sort((a, b) => a - b);
  if (!weeks.length) return 1;

  const now = Date.now();
  const cutoffMs = CUTOFF_HOURS_AFTER_LAST_GAME * 60 * 60 * 1000;

  for (const w of weeks) {
    const cutoff = maxKickoffByWeek.get(w) + cutoffMs;
    if (now < cutoff) return w;
  }

  // Minden hét lezárult (pl. szezon vége) -> az utolsó hetet mutassuk.
  return weeks[weeks.length - 1];
}