import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

function fromClinchFlags(arr = []) {
  return arr.map((c) => (c === "STAR" ? "*" : c));
}

router.get("/", async (req, res) => {
  const season = Number(req.query.season || 2025);
  const conference = req.query.conference; // opcionális: AFC/NFC

  const where = { season };
  if (conference === "AFC" || conference === "NFC") where.conference = conference;

  const rows = await prisma.standingsRow.findMany({
    where,
    orderBy: [{ conference: "asc" }, { division: "asc" }, { pct: "desc" }]
  });

  // visszaalakítjuk a frontend által eddig használt struktúrára
  const conferences = { AFC: { divisions: {} }, NFC: { divisions: {} } };

  for (const r of rows) {
    if (!conferences[r.conference].divisions[r.division]) {
      conferences[r.conference].divisions[r.division] = [];
    }
    conferences[r.conference].divisions[r.division].push({
      team: r.team,
      w: r.w,
      l: r.l,
      t: r.t,
      pct: r.pct,
      pf: r.pf,
      pa: r.pa,
      net: r.net,
      clinched: fromClinchFlags(r.clinched)
    });
  }

  return res.json({
    season,
    updatedAt: new Date().toISOString(),
    conferences
  });
});

export default router;