import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

const DEFAULT_SEASON = 2025;
const DEFAULT_WEEKS = [1, 2, 3];

const SLOT_TO_POSITION = {
  QB: "QB",
  RB1: "RB",
  RB2: "RB",
  WR1: "WR",
  WR2: "WR",
  TE: "TE",
  K: "K",
  DEF: "DEF",
};

const SLOT_ORDER = ["QB", "RB1", "RB2", "WR1", "WR2", "TE", "K", "DEF"];

function normalizePlayer(player) {
  if (!player) return null;

  return {
    id: player.id,
    position: player.position,
    teamCode: player.teamCode,
    firstName: player.firstName,
    lastName: player.lastName,
    displayName: player.displayName,
    headshotUrl: player.headshotUrl,
    isDefense: player.isDefense,
    currentScore: player.currentScore,
    overallStats: player.overallStats,
    weeklyStats: player.weeklyStats,
  };
}

async function ensureUserExists(userId) {
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, role: true },
  });

  return user;
}

async function getOrCreateRoster(userId, season, week) {
  const existingUser = await ensureUserExists(userId);

  if (!existingUser) {
    const err = new Error("Authenticated user not found in database.");
    err.statusCode = 401;
    throw err;
  }

  let roster = await prisma.perfectChallengeRoster.findUnique({
    where: {
      userId_season_week: {
        userId,
        season,
        week,
      },
    },
    include: {
      slots: {
        include: {
          player: true,
        },
      },
    },
  });

  if (!roster) {
    roster = await prisma.perfectChallengeRoster.create({
      data: {
        userId,
        season,
        week,
      },
      include: {
        slots: {
          include: {
            player: true,
          },
        },
      },
    });
  }

  return roster;
}

router.get("/weeks", requireAuth, async (req, res) => {
  return res.json({
    season: DEFAULT_SEASON,
    weeks: DEFAULT_WEEKS,
  });
});

router.get("/week", requireAuth, async (req, res) => {
  try {
    const season = Number(req.query.season || DEFAULT_SEASON);
    const week = Number(req.query.week || 1);
    const userId = req.user?.id;

    const roster = await getOrCreateRoster(userId, season, week);

    const pool = await prisma.perfectChallengePlayer.findMany({
      where: {
        season,
        isActive: true,
      },
      orderBy: [
        { position: "asc" },
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });

    const slotMap = Object.fromEntries(
      roster.slots.map((slot) => [slot.slot, normalizePlayer(slot.player)])
    );

    const slots = SLOT_ORDER.map((slotKey) => ({
      slot: slotKey,
      position: SLOT_TO_POSITION[slotKey],
      player: slotMap[slotKey] || null,
      canSwap: true,
    }));

    const poolByPosition = {
      QB: pool.filter((p) => p.position === "QB").map(normalizePlayer),
      RB: pool.filter((p) => p.position === "RB").map(normalizePlayer),
      WR: pool.filter((p) => p.position === "WR").map(normalizePlayer),
      TE: pool.filter((p) => p.position === "TE").map(normalizePlayer),
      K: pool.filter((p) => p.position === "K").map(normalizePlayer),
      DEF: pool.filter((p) => p.position === "DEF").map(normalizePlayer),
    };

    return res.json({
      season,
      week,
      slots,
      poolByPosition,
    });
  } catch (error) {
    console.error("GET /api/perfect-challenge/week error:", error);

    if (error.statusCode === 401) {
      return res.status(401).json({
        error: "A bejelentkezett felhasználó nem található az adatbázisban. Jelentkezz ki, majd be újra.",
      });
    }

    return res.status(500).json({
      error: "Nem sikerült betölteni a Perfect Challenge heti adatokat.",
    });
  }
});

router.put("/slot", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { season, week, slot, playerId } = req.body || {};

    const existingUser = await ensureUserExists(userId);
    if (!existingUser) {
      return res.status(401).json({
        error: "A bejelentkezett felhasználó nem található az adatbázisban. Jelentkezz ki, majd be újra.",
      });
    }

    if (!season || !week || !slot || !playerId) {
      return res.status(400).json({
        error: "A season, week, slot és playerId kötelező.",
      });
    }

    const expectedPosition = SLOT_TO_POSITION[slot];
    if (!expectedPosition) {
      return res.status(400).json({ error: "Érvénytelen slot." });
    }

    const player = await prisma.perfectChallengePlayer.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return res.status(404).json({ error: "Játékos nem található." });
    }

    if (player.season !== Number(season)) {
      return res.status(400).json({
        error: "A játékos nem ehhez a szezonhoz tartozik.",
      });
    }

    if (player.position !== expectedPosition) {
      return res.status(400).json({
        error: `Ehhez a slothoz csak ${expectedPosition} pozíciójú játékos választható.`,
      });
    }

    const roster = await getOrCreateRoster(userId, Number(season), Number(week));

    const duplicate = await prisma.perfectChallengeRosterSlot.findFirst({
      where: {
        rosterId: roster.id,
        playerId,
      },
    });

    if (duplicate && duplicate.slot !== slot) {
      return res.status(400).json({
        error: "Ez a játékos már ki van választva egy másik slotban.",
      });
    }

    await prisma.perfectChallengeRosterSlot.upsert({
      where: {
        rosterId_slot: {
          rosterId: roster.id,
          slot,
        },
      },
      create: {
        rosterId: roster.id,
        slot,
        playerId,
      },
      update: {
        playerId,
      },
    });

    return res.json({
      message: "Slot sikeresen frissítve.",
    });
  } catch (error) {
    console.error("PUT /api/perfect-challenge/slot error:", error);
    return res.status(500).json({
      error: "Nem sikerült frissíteni a slotot.",
    });
  }
});

export default router;