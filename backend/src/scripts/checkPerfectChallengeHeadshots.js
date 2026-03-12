import { perfectChallengePlayers } from "../data/perfectChallengePlayers.js";

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
    });

    return {
      ok: res.ok,
      status: res.status,
      finalUrl: res.url,
    };
  } catch (error) {
    return {
      ok: false,
      status: "FETCH_ERROR",
      finalUrl: url,
      error: error.message,
    };
  }
}

async function main() {
  const playersWithImages = perfectChallengePlayers.filter(
    (p) => !!p.headshotUrl
  );

  console.log(
    `Checking ${playersWithImages.length} Perfect Challenge headshot URLs...\n`
  );

  for (const player of playersWithImages) {
    const result = await checkUrl(player.headshotUrl);
    const name = `${player.firstName} ${player.lastName}`.trim();

    if (result.ok) {
      console.log(`✅ ${name} -> ${result.status}`);
    } else {
      console.log(
        `❌ ${name} -> ${result.status} -> ${player.headshotUrl}${
          result.error ? ` | ${result.error}` : ""
        }`
      );
    }
  }
}

main().catch((err) => {
  console.error("Headshot check failed:", err);
  process.exit(1);
});