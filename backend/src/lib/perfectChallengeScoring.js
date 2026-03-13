export function roundScore(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }
  
  function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  
  export function getDefAllowedPointsPenalty(allowedPoints) {
    const points = num(allowedPoints);
  
    if (points >= 0 && points <= 6) return 3;
    if (points >= 7 && points <= 13) return 6;
    if (points >= 14 && points <= 20) return 9;
    if (points >= 21 && points <= 27) return 10;
    if (points >= 28 && points <= 34) return 11;
    if (points >= 35) return 14;
  
    return 0;
  }
  
  export function calculatePerfectChallengeBreakdown(position, stats = {}) {
    const pos = String(position || "").toUpperCase();
  
    if (pos === "QB") {
      const passingYards = num(stats.passingYards) / 25;
      const passingTDs = num(stats.passingTDs) * 4;
      const interceptions = num(stats.interceptions) * -2;
      const rushingYards = num(stats.rushingYards) / 10;
      const rushingTDs = num(stats.rushingTDs) * 6;
      const fumble = num(stats.fumble) * -2;
  
      const total =
        passingYards +
        passingTDs +
        interceptions +
        rushingYards +
        rushingTDs +
        fumble;
  
      return {
        position: pos,
        breakdown: {
          passingYards: roundScore(passingYards),
          passingTDs: roundScore(passingTDs),
          interceptions: roundScore(interceptions),
          rushingYards: roundScore(rushingYards),
          rushingTDs: roundScore(rushingTDs),
          fumble: roundScore(fumble),
        },
        total: roundScore(total),
      };
    }
  
    if (pos === "RB") {
      const rushingYards = num(stats.rushingYards) / 10;
      const rushingTDs = num(stats.rushingTDs) * 6;
      const receivedYards = num(stats.receivedYards) / 10;
      const receivedTDs = num(stats.receivedTDs) * 6;
      const fumble = num(stats.fumble) * -2;
  
      const total =
        rushingYards +
        rushingTDs +
        receivedYards +
        receivedTDs +
        fumble;
  
      return {
        position: pos,
        breakdown: {
          rushingYards: roundScore(rushingYards),
          rushingTDs: roundScore(rushingTDs),
          receivedYards: roundScore(receivedYards),
          receivedTDs: roundScore(receivedTDs),
          fumble: roundScore(fumble),
        },
        total: roundScore(total),
      };
    }
  
    if (pos === "WR" || pos === "TE") {
      const receivedYards = num(stats.receivedYards) / 10;
      const receivedTDs = num(stats.receivedTDs) * 6;
      const rushingYards = num(stats.rushingYards) / 10;
      const rushingTDs = num(stats.rushingTDs) * 6;
      const fumbles = num(stats.fumbles) * -2;
  
      const total =
        receivedYards +
        receivedTDs +
        rushingYards +
        rushingTDs +
        fumbles;
  
      return {
        position: pos,
        breakdown: {
          receivedYards: roundScore(receivedYards),
          receivedTDs: roundScore(receivedTDs),
          rushingYards: roundScore(rushingYards),
          rushingTDs: roundScore(rushingTDs),
          fumbles: roundScore(fumbles),
        },
        total: roundScore(total),
      };
    }
  
    if (pos === "K") {
      const fg0to49Yards = num(stats.fg0to49Yards) * 3;
      const fg50plusYards = num(stats.fg50plusYards) * 5;
      const xp = num(stats.xp) * 1;
  
      const total = fg0to49Yards + fg50plusYards + xp;
  
      return {
        position: pos,
        breakdown: {
          fg0to49Yards: roundScore(fg0to49Yards),
          fg50plusYards: roundScore(fg50plusYards),
          xp: roundScore(xp),
        },
        total: roundScore(total),
      };
    }
  
    if (pos === "DEF") {
      const base = 10;
      const interception = num(stats.interception) * 2;
      const forcedFumble = num(stats.forcedFumble) * 2;
      const sack = num(stats.sack) * 1;
      const safety = num(stats.safety) * 2;
      const returnTD = num(stats.returnTD) * 6;
      const allowedPointsPenalty = getDefAllowedPointsPenalty(stats.allowedPoints) * -1;
  
      const total =
        base +
        interception +
        forcedFumble +
        sack +
        safety +
        returnTD +
        allowedPointsPenalty;
  
      return {
        position: pos,
        breakdown: {
          base: roundScore(base),
          interception: roundScore(interception),
          forcedFumble: roundScore(forcedFumble),
          sack: roundScore(sack),
          safety: roundScore(safety),
          returnTD: roundScore(returnTD),
          allowedPointsPenalty: roundScore(allowedPointsPenalty),
        },
        total: roundScore(total),
      };
    }
  
    return {
      position: pos,
      breakdown: {},
      total: 0,
    };
  }
  
  export function calculatePerfectChallengeScore(position, stats = {}) {
    return calculatePerfectChallengeBreakdown(position, stats).total;
  }