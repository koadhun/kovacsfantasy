import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";

const router = Router();

router.get("/schedule", requireAuth, requireAdmin, async (req, res) => {
  const season = Number(req.query.season);
  const week = Number(req.query.week);

  if (!season || !week) return res.status(400).json({ error: "season és week kötelező." });

  const games = await prisma.game.findMany({
    where: { season, week },
    orderBy: { kickoffAt: "asc" }
  });

  res.json({ games });
});

router.post("/schedule", requireAuth, requireAdmin, async (req, res) => {
  const { games } = req.body || {};
  if (!Array.isArray(games)) return res.status(400).json({ error: "games tömb kötelező." });

  await prisma.$transaction(
    games.map((g) =>
      prisma.game.update({
        where: { id: g.id },
        data: {
          homeScore: g.homeScore,
          awayScore: g.awayScore,
          status: g.status
        }
      })
    )
  );

  res.json({ message: "Results updated" });
});

export default router;