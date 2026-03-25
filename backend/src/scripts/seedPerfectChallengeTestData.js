import { PrismaClient } from "@prisma/client";
import { buildPerfectChallengeTestData } from "../data/perfectChallengePlayers.js";

const prisma = new PrismaClient();

const ESPN_NFL_TEAMS_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams";
const ESPN_NFL_TEAM_ROSTER_URL = (teamId) =>
  `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamId}/roster`;
const ESPN_NFL_ALL_ATHLETES_URL =
  "https://sports.core.api.espn.com/v3/sports/football/nfl/athletes?limit=20000";
const ESPN_HEADSHOT_URL = (athleteId) =>
  `https://a.espncdn.com/i/headshots/nfl/players/full/${athleteId}.png`;

const NAME_ALIASES = {
  "C.J. Stroud": ["CJ Stroud"],
  "T.J. Hockenson": ["TJ Hockenson"],
  "A.J. Brown": ["AJ Brown"],
  "Ja'Marr Chase": ["Jamarr Chase"],
  "Ka'imi Fairbairn": ["Kaimi Fairbairn"],
  "De'Von Achane": ["Devon Achane"],
  "Ja'Tavion Sanders": ["JaTavion Sanders", "Ja Tavion Sanders"],
  "D'Andre Swift": ["DAndre Swift"],
  "Aidan O'Connell": ["Aidan OConnell"],
  "Brian Thomas Jr.": ["Brian Thomas"],
  "Marvin Harrison Jr.": ["Marvin Harrison"],
  "Michael Pittman Jr.": ["Michael Pittman"],
  "Travis Etienne Jr.": ["Travis Etienne"],
};

function normalizeName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(jr|sr|ii|iii|iv)\b\.?/gi, "")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase();
}

function getCandidateNames(fullName) {
  const aliases = NAME_ALIASES[fullName] || [];
  return [fullName, ...aliases];
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "kovacsfantasy-seed/1.0",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText} for ${url}`);
  }

  return res.json();
}

function extractTeams(data) {
  const leagueTeams = data?.sports?.[0]?.leagues?.[0]?.teams;
  if (!Array.isArray(leagueTeams)) return [];

  return leagueTeams
    .map((entry) => entry?.team || entry)
    .filter(Boolean)
    .map((team) => ({
      id: String(team.id),
      abbreviation: String(team.abbreviation || "").toUpperCase(),
      name: team.displayName || team.name || team.shortDisplayName || "",
    }))
    .filter((team) => team.id && team.abbreviation);
}

function extractRosterPlayers(data) {
  const sections = Array.isArray(data?.athletes) ? data.athletes : [];
  const players = [];

  for (const section of sections) {
    const items = Array.isArray(section?.items) ? section.items : [];
    for (const item of items) {
      if (!item?.id) continue;

      const fullName =
        item.fullName ||
        [item.firstName, item.lastName].filter(Boolean).join(" ").trim();

      if (!fullName) continue;

      players.push({
        id: String(item.id),
        fullName,
      });
    }
  }

  return players;
}

function extractAllAthletes(data) {
  const items = Array.isArray(data?.items) ? data.items : [];
  return items
    .map((item) => ({
      id: item?.id ? String(item.id) : "",
      fullName:
        item?.fullName ||
        [item?.firstName, item?.lastName].filter(Boolean).join(" ").trim(),
    }))
    .filter((item) => item.id && item.fullName);
}

async function buildEspnHeadshotResolvers() {
  const teamsPayload = await fetchJson(ESPN_NFL_TEAMS_URL);
  const teams = extractTeams(teamsPayload);

  const rosterMap = new Map();

  for (const team of teams) {
    const rosterPayload = await fetchJson(ESPN_NFL_TEAM_ROSTER_URL(team.id));
    const rosterPlayers = extractRosterPlayers(rosterPayload);

    for (const player of rosterPlayers) {
      for (const candidate of getCandidateNames(player.fullName)) {
        rosterMap.set(
          `${team.abbreviation}:${normalizeName(candidate)}`,
          player.id
        );
      }
    }
  }

  const allAthletesPayload = await fetchJson(ESPN_NFL_ALL_ATHLETES_URL);
  const allAthletes = extractAllAthletes(allAthletesPayload);

  const globalMap = new Map();

  for (const athlete of allAthletes) {
    for (const candidate of getCandidateNames(athlete.fullName)) {
      const key = normalizeName(candidate);
      if (!globalMap.has(key)) {
        globalMap.set(key, athlete.id);
      }
    }
  }

  return {
    resolve(teamCode, fullName) {
      const candidates = getCandidateNames(fullName);

      for (const candidate of candidates) {
        const rosterKey = `${String(teamCode).toUpperCase()}:${normalizeName(candidate)}`;
        if (rosterMap.has(rosterKey)) {
          return rosterMap.get(rosterKey);
        }
      }

      for (const candidate of candidates) {
        const globalKey = normalizeName(candidate);
        if (globalMap.has(globalKey)) {
          return globalMap.get(globalKey);
        }
      }

      return null;
    },
  };
}

async function main() {
  const season = 2025;
  const weeks = [1, 2, 3];
  const { games, players } = buildPerfectChallengeTestData(new Date());

  console.log("Resolving ESPN athlete IDs and headshots...");
  const resolver = await buildEspnHeadshotResolvers();

  const enrichedPlayers = players.map((player) => {
    if (player.position === "DEF") {
      return {
        ...player,
        headshotUrl: null,
      };
    }

    const athleteId = resolver.resolve(player.teamCode, player.displayName);

    return {
      ...player,
      headshotUrl: athleteId ? ESPN_HEADSHOT_URL(athleteId) : null,
    };
  });

  const missing = enrichedPlayers.filter(
    (player) => player.position !== "DEF" && !player.headshotUrl
  );

  if (missing.length) {
    console.warn(
      "Missing ESPN headshots for:",
      missing.map((p) => `${p.teamCode} - ${p.displayName}`).join(", ")
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.perfectChallengeRosterSlot.deleteMany({
      where: {
        roster: {
          season,
          week: { in: weeks },
        },
      },
    });

    await tx.perfectChallengeRoster.deleteMany({
      where: {
        season,
        week: { in: weeks },
      },
    });

    await tx.perfectChallengePlayer.deleteMany({
      where: {
        season,
        week: { in: weeks },
      },
    });

    await tx.game.deleteMany({
      where: {
        season,
        week: { in: weeks },
      },
    });

    await tx.game.createMany({
      data: games,
    });

    await tx.perfectChallengePlayer.createMany({
      data: enrichedPlayers,
    });
  });

  console.log(
    `Seed completed: ${games.length} games and ${enrichedPlayers.length} perfect challenge players inserted.`
  );

  if (!missing.length) {
    console.log("All non-DEF players received ESPN headshots.");
  }
}

main()
  .catch((error) => {
    console.error("Perfect Challenge test seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });