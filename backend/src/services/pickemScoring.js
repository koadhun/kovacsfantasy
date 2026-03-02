export function computePickEmPoints(correctCount, totalGames) {
  // 10 pont / helyes tipp
  let points = correctCount * 10;

  // bónuszok
  if (correctCount >= 5) points += 10;
  if (correctCount >= 10) points += 30;

  // “minden meccs jó” bónusz: csak akkor, ha az összes heti meccs végleges
  if (totalGames > 0 && correctCount === totalGames) {
    points += 50;
  }

  return points;
}