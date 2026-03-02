import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";

const router = Router();

function toClinchFlags(arr = []) {
  return arr.map((c) => (c === "*" ? "STAR" : c));
}

// Bulk replace for a season
router.put("/standings", requireAuth, requireAdmin, async (req, res) => {
  const { season, conferences } = req.body;

  if (!season || !conferences?.AFC?.divisions || !conferences?.NFC?.divisions) {
    return res.status(400).json({ error: "Hibás payload. season + conferences szükséges." });
  }

  // törlés + újra feltöltés (egyszerű és determinisztikus)
  await prisma.standingsRow.deleteMany({ where: { season: Number(season) } });

  const rows = [];
  for (const conf of ["AFC", "NFC"]) {
    const divs = conferences[conf].divisions;
    for (const divisionName of Object.keys(divs)) {
      for (const r of divs[divisionName]) {
        rows.push({
          season: Number(season),
          conference: conf,
          division: divisionName,
          team: r.team,
          w: Number(r.w),
          l: Number(r.l),
          t: Number(r.t),
          pct: Number(r.pct),
          pf: Number(r.pf),
          pa: Number(r.pa),
          net: Number(r.net),
          clinched: toClinchFlags(r.clinched || [])
        });
      }
    }
  }

  await prisma.standingsRow.createMany({ data: rows });

  return res.json({ message: "Standings frissítve.", inserted: rows.length });
});

export default router;