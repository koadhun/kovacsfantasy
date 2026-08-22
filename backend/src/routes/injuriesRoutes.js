import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

// GET /api/injuries?team=SF
router.get("/", requireAuth, async (req, res) => {
  const team = req.query.team;

  const injuries = await prisma.injury.findMany({
    where: team ? { teamCode: String(team).toUpperCase() } : undefined,
    orderBy: [{ teamCode: "asc" }, { playerName: "asc" }],
  });

  res.json({ injuries });
});

export default router;