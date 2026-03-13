import { perfectChallengePlayers } from "../data/perfectChallengePlayers.js";
import { calculatePerfectChallengeBreakdown } from "../lib/perfectChallengeScoring.js";

function playerName(player) {
  return player.displayName || `${player.firstName} ${player.lastName}`;
}

async function main() {
  console.log("Perfect Challenge weekly scoring check:\n");

  for (const player of perfectChallengePlayers) {
    const result = calculatePerfectChallengeBreakdown(
      player.position,
      player.weeklyStats
    );

    console.log(
      `${player.position.padEnd(3)} | ${playerName(player).padEnd(24)} | total = ${result.total}`
    );
    console.log(result.breakdown);
    console.log("--------------------------------------------------");
  }
}

main().catch((err) => {
  console.error("checkPerfectChallengeScoring failed:", err);
  process.exit(1);
});