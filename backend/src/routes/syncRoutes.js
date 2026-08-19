import { Router } from "express";
import { syncRoster } from "../scripts/syncPerfectChallengeRoster.js";
import { syncLiveGames } from "../scripts/syncLiveGames.js";
import { syncLiveStats } from "../scripts/syncLiveStats.js";
import { syncLivePerfectChallenge } from "../scripts/syncLivePerfectChallenge.js";

const router = Router();

function checkSyncSecret(req, res) {
  const provided = req.header("x-sync-secret");
  if (!provided || provided !== process.env.SYNC_SECRET) {
    res.status(401).json({ error: "Érvénytelen sync secret." });
    return false;
  }
  return true;
}

// POST /api/sync/perfect-challenge-roster
router.post("/perfect-challenge-roster", async (req, res) => {
  if (!checkSyncSecret(req, res)) return;

  const season = Number(req.query.season) || new Date().getFullYear();
  const weeksParam = req.query.weeks;
  const weeks = weeksParam
    ? String(weeksParam).split(",").map(Number)
    : Array.from({ length: 18 }, (_, i) => i + 1);

  res.json({ message: "Sync elindult a háttérben.", season, weeks });

  try {
    console.log(`[cron] Perfect Challenge roster sync indul: season=${season}`);
    await syncRoster(season, weeks);
    console.log(`[cron] Perfect Challenge roster sync kész.`);
  } catch (err) {
    console.error("[cron] Sync hiba:", err);
  }
});

// POST /api/sync/live-games
// Külső cron szolgáltatás hívja 30 percenként.
// Sorban: 1) meccs-állapotok, 2) Stats oldal statisztikái, 3) Perfect Challenge élő statjai/pontszáma.
router.post("/live-games", async (req, res) => {
  if (!checkSyncSecret(req, res)) return;

  const season = Number(req.query.season) || new Date().getFullYear();

  try {
    const gamesResult = await syncLiveGames(season);
    const statsResult = await syncLiveStats(season);
    const pcResult = await syncLivePerfectChallenge(season);

    res.json({
      message: "Live sync lefutott.",
      season,
      games: gamesResult,
      stats: statsResult,
      perfectChallenge: pcResult,
    });
  } catch (err) {
    console.error("[cron] Live sync hiba:", err);
    res.status(500).json({ error: "Live sync sikertelen.", detail: err.message });
  }
});

export default router;