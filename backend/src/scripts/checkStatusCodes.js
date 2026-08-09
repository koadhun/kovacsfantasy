import "dotenv/config";

const LEAGUE_ID = 1;
const API_BASE = "https://v1.american-football.api-sports.io";

async function main() {
  const season = Number(process.argv[2]) || 2025;

  const res = await fetch(`${API_BASE}/games?league=${LEAGUE_ID}&season=${season}`, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY }
  });
  const data = await res.json();

  const statusCounts = {};
  for (const g of data.response) {
    const short = g.game?.status?.short;
    statusCounts[short] = (statusCounts[short] || 0) + 1;
  }

  console.log("Előforduló status.short értékek és darabszámuk:");
  console.log(statusCounts);
}

main();