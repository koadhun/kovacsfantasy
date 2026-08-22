import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { teamCodeFromApiId, TEAM_CODE_BY_API_ID } from "../lib/nflTeams.js";

const API_BASE = "https://v1.american-football.api-sports.io";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTeamInjuries(apiTeamId) {
  const res = await fetch(`${API_BASE}/injuries?team=${apiTeamId}`, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(JSON.stringify(data.errors));
  }

  return data.response || [];
}

export async function syncInjuries() {
  const apiTeamIds = Object.keys(TEAM_CODE_BY_API_ID).map(Number);
  const seenPlayerIds = new Set();

  for (const apiTeamId of apiTeamIds) {
    const teamCode = teamCodeFromApiId(apiTeamId);
    console.log(`Serulesek lekerese: ${teamCode} (team=${apiTeamId})...`);

    let injuries = [];
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        injuries = await fetchTeamInjuries(apiTeamId);
        break;
      } catch (err) {
        console.warn(`  Hiba (${attempt}. probalkozas): ${err.message}`);
        await sleep(1500 * attempt);
      }
    }

    for (const inj of injuries) {
      const apiPlayerId = inj.player?.id;
      if (!apiPlayerId) continue;
      seenPlayerIds.add(apiPlayerId);

      await prisma.injury.upsert({
        where: { apiPlayerId },
        update: {
          playerName: inj.player.name,
          headshotUrl: inj.player.image || null,
          teamCode,
          status: inj.status || "Unknown",
          description: inj.description || "",
          reportDate: inj.date ? new Date(inj.date) : null,
        },
        create: {
          apiPlayerId,
          playerName: inj.player.name,
          headshotUrl: inj.player.image || null,
          teamCode,
          status: inj.status || "Unknown",
          description: inj.description || "",
          reportDate: inj.date ? new Date(inj.date) : null,
        },
      });
    }

    await sleep(300);
  }

  const deleted = await prisma.injury.deleteMany({
    where: { apiPlayerId: { notIn: [...seenPlayerIds] } },
  });

  console.log(`Kesz. ${seenPlayerIds.size} aktiv serules, ${deleted.count} torolve (felgyogyult).`);
  return { active: seenPlayerIds.size, removed: deleted.count };
}

if (process.argv[1] && process.argv[1].endsWith("syncInjuries.js")) {
  syncInjuries()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error("Hiba:", err);
      prisma.$disconnect();
      process.exit(1);
    });
}