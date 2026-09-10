import "dotenv/config";

const API_BASE = "https://v1.american-football.api-sports.io";

// Példa esemény-komment, amit a /games/events ad vissza egy sikeres rúgásnál:
//   "Marshall Koehn 28 Yd Field Goal"
//   "Josh Brown 20 Yd Field Goal"
const FG_COMMENT_REGEX = /(\d+)\s*Yd Field Goal/i;

/**
 * Lekéri egy meccs eseményeit, és kigyűjti minden sikeres field goalt
 * (rúgó apiPlayerId + pontos yard), a "Kicking" statisztika-kategória
 * megbízhatatlan (mindig 0) táv-sáv mezői helyett.
 *
 * @param {number|string} apiGameId - az API-Football saját meccs-azonosítója
 * @returns {Promise<Map<number, number[]>>} apiPlayerId -> [rúgott yardok tömbje]
 */
export async function fetchFieldGoalYardsByPlayer(apiGameId) {
  const res = await fetch(`${API_BASE}/games/events?id=${apiGameId}`, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(JSON.stringify(data.errors));
  }

  const events = data.response || [];
  const byPlayer = new Map();

  for (const event of events) {
    if (event.type !== "FG") continue;

    const apiPlayerId = event.player?.id;
    const comment = event.comment || "";
    const match = comment.match(FG_COMMENT_REGEX);

    if (!apiPlayerId || !match) continue;

    const yards = Number(match[1]);
    if (!Number.isFinite(yards)) continue;

    if (!byPlayer.has(apiPlayerId)) byPlayer.set(apiPlayerId, []);
    byPlayer.get(apiPlayerId).push(yards);
  }

  return byPlayer;
}

/**
 * A kinyert yard-lista alapján kiszámolja a Perfect Challenge pontozáshoz
 * használt két számlálót: hány rúgás volt 0-49 yard között, és hány 50+.
 *
 * @param {number[]} yardsList
 * @returns {{ fg0to49Yards: number, fg50plusYards: number }}
 */
export function bucketFieldGoalYards(yardsList) {
  let fg0to49Yards = 0;
  let fg50plusYards = 0;

  for (const y of yardsList || []) {
    if (y >= 50) fg50plusYards += 1;
    else fg0to49Yards += 1;
  }

  return { fg0to49Yards, fg50plusYards };
}