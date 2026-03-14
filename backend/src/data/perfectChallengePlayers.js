const TEAM_PROFILES = {
    ARI: { name: "Arizona Cardinals", qb: "Kyler Murray", rb: "James Conner", wr: "Marvin Harrison Jr.", te: "Trey McBride", k: "Matt Prater", offense: 71, defense: 63 },
    ATL: { name: "Atlanta Falcons", qb: "Kirk Cousins", rb: "Bijan Robinson", wr: "Drake London", te: "Kyle Pitts", k: "Younghoe Koo", offense: 74, defense: 68 },
    BAL: { name: "Baltimore Ravens", qb: "Lamar Jackson", rb: "Derrick Henry", wr: "Zay Flowers", te: "Mark Andrews", k: "Justin Tucker", offense: 86, defense: 84 },
    BUF: { name: "Buffalo Bills", qb: "Josh Allen", rb: "James Cook", wr: "Khalil Shakir", te: "Dalton Kincaid", k: "Tyler Bass", offense: 84, defense: 79 },
    CAR: { name: "Carolina Panthers", qb: "Bryce Young", rb: "Chuba Hubbard", wr: "Diontae Johnson", te: "Ja'Tavion Sanders", k: "Eddy Pineiro", offense: 61, defense: 58 },
    CHI: { name: "Chicago Bears", qb: "Caleb Williams", rb: "D'Andre Swift", wr: "DJ Moore", te: "Cole Kmet", k: "Cairo Santos", offense: 73, defense: 71 },
    CIN: { name: "Cincinnati Bengals", qb: "Joe Burrow", rb: "Zack Moss", wr: "Ja'Marr Chase", te: "Mike Gesicki", k: "Evan McPherson", offense: 83, defense: 66 },
    CLE: { name: "Cleveland Browns", qb: "Deshaun Watson", rb: "Jerome Ford", wr: "Amari Cooper", te: "David Njoku", k: "Dustin Hopkins", offense: 69, defense: 79 },
    DAL: { name: "Dallas Cowboys", qb: "Dak Prescott", rb: "Rico Dowdle", wr: "CeeDee Lamb", te: "Jake Ferguson", k: "Brandon Aubrey", offense: 80, defense: 77 },
    DEN: { name: "Denver Broncos", qb: "Bo Nix", rb: "Javonte Williams", wr: "Courtland Sutton", te: "Adam Trautman", k: "Wil Lutz", offense: 68, defense: 70 },
    DET: { name: "Detroit Lions", qb: "Jared Goff", rb: "Jahmyr Gibbs", wr: "Amon-Ra St. Brown", te: "Sam LaPorta", k: "Jake Bates", offense: 85, defense: 74 },
    GB: { name: "Green Bay Packers", qb: "Jordan Love", rb: "Josh Jacobs", wr: "Jayden Reed", te: "Luke Musgrave", k: "Brandon McManus", offense: 79, defense: 73 },
    HOU: { name: "Houston Texans", qb: "C.J. Stroud", rb: "Joe Mixon", wr: "Nico Collins", te: "Dalton Schultz", k: "Ka'imi Fairbairn", offense: 81, defense: 76 },
    IND: { name: "Indianapolis Colts", qb: "Anthony Richardson", rb: "Jonathan Taylor", wr: "Michael Pittman Jr.", te: "Jelani Woods", k: "Matt Gay", offense: 75, defense: 67 },
    JAX: { name: "Jacksonville Jaguars", qb: "Trevor Lawrence", rb: "Travis Etienne Jr.", wr: "Brian Thomas Jr.", te: "Evan Engram", k: "Cam Little", offense: 76, defense: 68 },
    KC: { name: "Kansas City Chiefs", qb: "Patrick Mahomes", rb: "Isiah Pacheco", wr: "Rashee Rice", te: "Travis Kelce", k: "Harrison Butker", offense: 87, defense: 80 },
    LAC: { name: "Los Angeles Chargers", qb: "Justin Herbert", rb: "Gus Edwards", wr: "Ladd McConkey", te: "Will Dissly", k: "Cameron Dicker", offense: 75, defense: 71 },
    LAR: { name: "Los Angeles Rams", qb: "Matthew Stafford", rb: "Kyren Williams", wr: "Puka Nacua", te: "Tyler Higbee", k: "Joshua Karty", offense: 80, defense: 69 },
    LV: { name: "Las Vegas Raiders", qb: "Aidan O'Connell", rb: "Zamir White", wr: "Davante Adams", te: "Michael Mayer", k: "Daniel Carlson", offense: 66, defense: 65 },
    MIA: { name: "Miami Dolphins", qb: "Tua Tagovailoa", rb: "De'Von Achane", wr: "Tyreek Hill", te: "Jonnu Smith", k: "Jason Sanders", offense: 82, defense: 70 },
    MIN: { name: "Minnesota Vikings", qb: "Sam Darnold", rb: "Aaron Jones", wr: "Justin Jefferson", te: "T.J. Hockenson", k: "Will Reichard", offense: 79, defense: 74 },
    NE: { name: "New England Patriots", qb: "Jacoby Brissett", rb: "Rhamondre Stevenson", wr: "DeMario Douglas", te: "Hunter Henry", k: "Joey Slye", offense: 60, defense: 66 },
    NO: { name: "New Orleans Saints", qb: "Derek Carr", rb: "Alvin Kamara", wr: "Chris Olave", te: "Juwan Johnson", k: "Blake Grupe", offense: 73, defense: 70 },
    NYG: { name: "New York Giants", qb: "Daniel Jones", rb: "Devin Singletary", wr: "Malik Nabers", te: "Theo Johnson", k: "Graham Gano", offense: 64, defense: 64 },
    NYJ: { name: "New York Jets", qb: "Aaron Rodgers", rb: "Breece Hall", wr: "Garrett Wilson", te: "Tyler Conklin", k: "Greg Zuerlein", offense: 77, defense: 81 },
    PHI: { name: "Philadelphia Eagles", qb: "Jalen Hurts", rb: "Saquon Barkley", wr: "A.J. Brown", te: "Dallas Goedert", k: "Jake Elliott", offense: 84, defense: 75 },
    PIT: { name: "Pittsburgh Steelers", qb: "Russell Wilson", rb: "Najee Harris", wr: "George Pickens", te: "Pat Freiermuth", k: "Chris Boswell", offense: 69, defense: 82 },
    SF: { name: "San Francisco 49ers", qb: "Brock Purdy", rb: "Christian McCaffrey", wr: "Deebo Samuel", te: "George Kittle", k: "Jake Moody", offense: 86, defense: 78 },
    SEA: { name: "Seattle Seahawks", qb: "Geno Smith", rb: "Kenneth Walker III", wr: "DK Metcalf", te: "Noah Fant", k: "Jason Myers", offense: 74, defense: 69 },
    TB: { name: "Tampa Bay Buccaneers", qb: "Baker Mayfield", rb: "Rachaad White", wr: "Mike Evans", te: "Cade Otton", k: "Chase McLaughlin", offense: 78, defense: 72 },
    TEN: { name: "Tennessee Titans", qb: "Will Levis", rb: "Tony Pollard", wr: "Calvin Ridley", te: "Chigoziem Okonkwo", k: "Nick Folk", offense: 67, defense: 64 },
    WAS: { name: "Washington Commanders", qb: "Jayden Daniels", rb: "Brian Robinson Jr.", wr: "Terry McLaurin", te: "Zach Ertz", k: "Austin Seibert", offense: 74, defense: 61 },
  };
  
  export const WEEKLY_SCHEDULE = {
    1: [
      { away: "BUF", home: "BAL" },
      { away: "CIN", home: "CLE" },
      { away: "LAR", home: "DET" },
      { away: "PIT", home: "ATL" },
      { away: "PHI", home: "GB" },
      { away: "KC", home: "JAX" },
      { away: "MIA", home: "NE" },
      { away: "NYJ", home: "SF" },
      { away: "DAL", home: "TB" },
      { away: "NO", home: "CAR" },
      { away: "MIN", home: "NYG" },
      { away: "WAS", home: "ARI" },
      { away: "SEA", home: "DEN" },
      { away: "LAC", home: "LV" },
      { away: "CHI", home: "TEN" },
      { away: "IND", home: "HOU" },
    ],
    2: [
      { away: "BAL", home: "CIN" },
      { away: "DET", home: "MIN" },
      { away: "BUF", home: "MIA" },
      { away: "NE", home: "NYJ" },
      { away: "TB", home: "DET" },
      { away: "GB", home: "IND" },
      { away: "DAL", home: "PHI" },
      { away: "SF", home: "SEA" },
      { away: "KC", home: "BUF" },
      { away: "ATL", home: "NO" },
      { away: "CAR", home: "LAC" },
      { away: "ARI", home: "LAR" },
      { away: "JAX", home: "HOU" },
      { away: "PIT", home: "DEN" },
      { away: "TEN", home: "CHI" },
      { away: "LV", home: "WAS" },
    ],
    3: [
      { away: "BAL", home: "BUF" },
      { away: "DET", home: "GB" },
      { away: "MIA", home: "NYJ" },
      { away: "PHI", home: "DAL" },
      { away: "CIN", home: "KC" },
      { away: "ATL", home: "TB" },
      { away: "HOU", home: "IND" },
      { away: "SF", home: "LAR" },
      { away: "SEA", home: "ARI" },
      { away: "NO", home: "CAR" },
      { away: "CLE", home: "PIT" },
      { away: "MIN", home: "CHI" },
      { away: "JAX", home: "TEN" },
      { away: "WAS", home: "NYG" },
      { away: "LAC", home: "DEN" },
      { away: "LV", home: "NE" },
    ],
  };
  
  export const matchupByWeek = Object.fromEntries(
    Object.entries(WEEKLY_SCHEDULE).map(([week, games]) => {
      const map = {};
      for (const game of games) {
        map[game.away] = game.home;
        map[game.home] = game.away;
      }
      return [Number(week), map];
    })
  );
  
  function round1(value) {
    return Number(Number(value).toFixed(1));
  }
  
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  
  function clampInt(value, min, max) {
    return Math.round(clamp(value, min, max));
  }
  
  function scorePlayer(position, stats) {
    if (position === "QB") {
      return (
        (stats.passingYards || 0) / 25 +
        (stats.passingTDs || 0) * 4 -
        (stats.interceptions || 0) * 2 +
        (stats.rushingYards || 0) / 10 +
        (stats.rushingTDs || 0) * 6 -
        (stats.fumble || 0) * 2
      );
    }
  
    if (position === "RB" || position === "WR" || position === "TE") {
      return (
        (stats.rushingYards || 0) / 10 +
        (stats.receivedYards || 0) / 10 +
        (stats.rushingTDs || 0) * 6 +
        (stats.receivedTDs || 0) * 6 -
        (stats.fumble || stats.fumbles || 0) * 2
      );
    }
  
    if (position === "K") {
      return (
        (stats.fg0to49Yards || 0) * 3 +
        (stats.fg50plusYards || 0) * 5 +
        (stats.xp || 0)
      );
    }
  
    const allowed = stats.allowedPoints || 0;
    let pointsAllowedBonus = 0;
    if (allowed === 0) pointsAllowedBonus = 10;
    else if (allowed <= 6) pointsAllowedBonus = 7;
    else if (allowed <= 13) pointsAllowedBonus = 4;
    else if (allowed <= 20) pointsAllowedBonus = 1;
    else if (allowed <= 27) pointsAllowedBonus = 0;
    else if (allowed <= 34) pointsAllowedBonus = -1;
    else pointsAllowedBonus = -4;
  
    return (
      (stats.interception || 0) * 2 +
      (stats.forcedFumble || 0) * 2 +
      (stats.sack || 0) * 1 +
      (stats.safety || 0) * 2 +
      (stats.returnTD || 0) * 6 +
      pointsAllowedBonus
    );
  }
  
  function createTeamOffenseBox(teamCode, opponentCode, week) {
    const team = TEAM_PROFILES[teamCode];
    const opponent = TEAM_PROFILES[opponentCode];
    const weekSwing = ((week * 17 + team.offense + opponent.defense) % 9) - 4;
  
    const passingYards = round1(
      clamp(210 + (team.offense - opponent.defense) * 4.2 + weekSwing * 7, 165, 345)
    );
    const passingTDs = clampInt(
      1 + (team.offense - opponent.defense) / 18 + (weekSwing > 0 ? 1 : 0),
      1,
      4
    );
    const interceptions = clampInt(
      1 + (opponent.defense - team.offense) / 26 + (weekSwing < -1 ? 1 : 0),
      0,
      3
    );
    const rushingYards = round1(
      clamp(86 + (team.offense - opponent.defense) * 2.5 + weekSwing * 5, 62, 176)
    );
    const rushingTDs = clampInt(
      1 + (team.offense - opponent.defense) / 28 + (weekSwing > 1 ? 1 : 0),
      0,
      3
    );
    const fumbles = clampInt(
      1 + (opponent.defense - team.offense) / 30 + (weekSwing < -2 ? 1 : 0),
      0,
      2
    );
  
    const teamPoints = clampInt(
      17 + (team.offense - opponent.defense) / 3.1 + weekSwing,
      13,
      38
    );
  
    const qbRushShare = round1(clamp(18 + week * 3 + (teamCode === "BAL" || teamCode === "ARI" || teamCode === "PHI" ? 18 : 0), 8, 58));
    const rbRushShare = round1(clamp(rushingYards * 0.72, 48, 132));
    const wrRushShare = round1(clamp(rushingYards * 0.10, 0, 22));
    const teRushShare = round1(clamp(rushingYards - qbRushShare - rbRushShare - wrRushShare, 0, 16));
  
    const wrReceivedYards = round1(clamp(passingYards * 0.41, 58, 154));
    const teReceivedYards = round1(clamp(passingYards * 0.24, 34, 102));
    const rbReceivedYards = round1(clamp(passingYards * 0.12, 12, 48));
  
    const passTdSplit = {
      wr: Math.max(1, Math.min(3, passingTDs - (team.offense > 78 ? 1 : 0))),
      te: Math.max(0, Math.min(2, passingTDs >= 2 ? 1 : 0)),
      rb: Math.max(0, passingTDs >= 4 ? 1 : 0),
    };
  
    const qbStats = {
      passingYards,
      passingTDs,
      interceptions,
      rushingYards: qbRushShare,
      rushingTDs: teamCode === "BAL" || teamCode === "PHI" || teamCode === "ARI" ? Math.min(1, rushingTDs) : 0,
      fumble: 0,
    };
  
    const rbStats = {
      rushingYards: rbRushShare,
      rushingTDs: Math.max(0, rushingTDs - (qbStats.rushingTDs || 0)),
      receivedYards: rbReceivedYards,
      receivedTDs: passTdSplit.rb,
      fumble: fumbles > 0 ? 1 : 0,
    };
  
    const wrStats = {
      receivedYards: wrReceivedYards,
      receivedTDs: passTdSplit.wr,
      rushingYards: wrRushShare,
      rushingTDs: 0,
      fumbles: 0,
    };
  
    const teStats = {
      receivedYards: teReceivedYards,
      receivedTDs: passTdSplit.te,
      rushingYards: teRushShare,
      rushingTDs: 0,
      fumbles: 0,
    };
  
    const extraPoints = clampInt(teamPoints / 7, 1, 5);
    const madeFieldGoals = clampInt((teamPoints - extraPoints) / 6, 1, 3);
    const kStats = {
      fg0to49Yards: Math.max(0, madeFieldGoals - (teamPoints >= 27 ? 1 : 0)),
      fg50plusYards: teamPoints >= 27 ? 1 : 0,
      xp: extraPoints,
    };
  
    return {
      teamPoints,
      qbStats,
      rbStats,
      wrStats,
      teStats,
      kStats,
    };
  }
  
  function createDefenseBox(teamCode, opponentCode, opponentOffenseBox, week) {
    const team = TEAM_PROFILES[teamCode];
    const opponent = TEAM_PROFILES[opponentCode];
    const pressure = team.defense - opponent.offense;
  
    const sack = clampInt(2 + pressure / 14 + (week % 2 ? 1 : 0), 1, 6);
    const interception = clampInt(1 + pressure / 24, 0, 3);
    const forcedFumble = clampInt(1 + pressure / 26 + (week % 3 === 0 ? 1 : 0), 0, 3);
    const safety = week === 3 && pressure > 8 ? 1 : 0;
    const returnTD = pressure > 12 && week % 2 === 0 ? 1 : 0;
  
    return {
      allowedPassingYards: opponentOffenseBox.qbStats.passingYards,
      allowedRushingYards: round1(
        opponentOffenseBox.rbStats.rushingYards +
          opponentOffenseBox.qbStats.rushingYards +
          opponentOffenseBox.wrStats.rushingYards +
          opponentOffenseBox.teStats.rushingYards
      ),
      weeklyStats: {
        interception,
        forcedFumble,
        sack,
        safety,
        returnTD,
        allowedPoints: opponentOffenseBox.teamPoints,
      },
    };
  }
  
  function buildGameTiming(week, gameIndex, now = new Date()) {
    const base = new Date(now);
    base.setSeconds(0, 0);
  
    if (week === 1) {
      base.setDate(base.getDate() - 21 + gameIndex);
      return {
        kickoffAt: new Date(base),
        started: true,
        final: true,
      };
    }
  
    if (week === 2) {
      base.setDate(base.getDate() - 10 + gameIndex);
      return {
        kickoffAt: new Date(base),
        started: true,
        final: true,
      };
    }
  
    if (gameIndex < 8) {
      base.setDate(base.getDate() - 1);
      base.setHours(18 + (gameIndex % 4), 0, 0, 0);
      return {
        kickoffAt: new Date(base),
        started: true,
        final: true,
      };
    }
  
    base.setDate(base.getDate() + 2 + (gameIndex - 8));
    base.setHours(18 + (gameIndex % 4), 0, 0, 0);
    return {
      kickoffAt: new Date(base),
      started: false,
      final: false,
    };
  }
  
  function createPlayerRow({
    season,
    week,
    position,
    teamCode,
    firstName,
    lastName,
    displayName,
    headshotUrl = null,
    isDefense = false,
    avgScore,
    currentScore,
    lastWeekOpponentTeam,
    opponentDefenseTeamCode,
    currentWeekOpponentTeam,
    currentWeekOpponentDefenseTeamCode,
    allowedPassingYards = null,
    allowedRushingYards = null,
    overallStats,
    weeklyStats,
  }) {
    return {
      season,
      week,
      position,
      teamCode,
      firstName,
      lastName,
      displayName,
      headshotUrl,
      isDefense,
      currentScore: round1(currentScore),
      avgScore: round1(avgScore),
      lastWeekOpponentTeam,
      opponentDefenseTeamCode,
      currentWeekOpponentTeam,
      currentWeekOpponentDefenseTeamCode,
      allowedPassingYards,
      allowedRushingYards,
      overallStats,
      weeklyStats,
      isActive: true,
    };
  }
  
  function makeHeadshotUrl(position, playerName) {
    if (position === "DEF") return null;
    const slug = playerName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `https://a.espncdn.com/i/headshots/nfl/players/full/${slug}.png`;
  }
  
  export function buildPerfectChallengeTestData(now = new Date()) {
    const season = 2025;
    const history = new Map();
    const players = [];
    const games = [];
  
    const getHistory = (key) => history.get(key) || { total: 0, count: 0 };
  
    const pushWithAverage = (row, historyKey) => {
      const previous = getHistory(historyKey);
      const avgScore = (previous.total + row.currentScore) / (previous.count + 1);
      row.avgScore = round1(avgScore);
      history.set(historyKey, {
        total: previous.total + row.currentScore,
        count: previous.count + 1,
      });
      players.push(row);
    };
  
    for (const [weekKey, schedule] of Object.entries(WEEKLY_SCHEDULE)) {
      const week = Number(weekKey);
  
      schedule.forEach((game, gameIndex) => {
        const awayTeam = TEAM_PROFILES[game.away];
        const homeTeam = TEAM_PROFILES[game.home];
  
        const awayOffense = createTeamOffenseBox(game.away, game.home, week);
        const homeOffense = createTeamOffenseBox(game.home, game.away, week);
  
        const awayDefense = createDefenseBox(game.away, game.home, homeOffense, week);
        const homeDefense = createDefenseBox(game.home, game.away, awayOffense, week);
  
        const timing = buildGameTiming(week, gameIndex, now);
  
        games.push({
          season,
          week,
          gameType: "REG",
          kickoffAt: timing.kickoffAt,
          homeTeam: game.home,
          awayTeam: game.away,
          homeScore: timing.final ? homeOffense.teamPoints : null,
          awayScore: timing.final ? awayOffense.teamPoints : null,
          status: timing.final ? "FINAL" : "SCHEDULED",
        });
  
        const commonMeta = (teamCode, oppCode) => ({
          season,
          week,
          teamCode,
          lastWeekOpponentTeam:
            week > 1 ? TEAM_PROFILES[matchupByWeek[week - 1][teamCode]].name : null,
          opponentDefenseTeamCode: oppCode,
          currentWeekOpponentTeam: TEAM_PROFILES[oppCode].name,
          currentWeekOpponentDefenseTeamCode: oppCode,
        });
  
        const awayMeta = commonMeta(game.away, game.home);
        const homeMeta = commonMeta(game.home, game.away);
  
        pushWithAverage(
          createPlayerRow({
            ...awayMeta,
            position: "QB",
            firstName: awayTeam.qb.split(" ").slice(0, -1).join(" "),
            lastName: awayTeam.qb.split(" ").slice(-1).join(" "),
            displayName: awayTeam.qb,
            headshotUrl: makeHeadshotUrl("QB", awayTeam.qb),
            currentScore: scorePlayer("QB", awayOffense.qbStats),
            avgScore: 0,
            overallStats: {
              passingYards: round1(awayOffense.qbStats.passingYards * (1.8 + week * 0.15)),
              passingTDs: round1(awayOffense.qbStats.passingTDs * (1.7 + week * 0.1)),
              interceptions: round1(Math.max(0, awayOffense.qbStats.interceptions * (0.8 + week * 0.05))),
              rushingYards: round1(awayOffense.qbStats.rushingYards * (1.7 + week * 0.1)),
              rushingTDs: round1(awayOffense.qbStats.rushingTDs * (1.6 + week * 0.05)),
            },
            weeklyStats: awayOffense.qbStats,
          }),
          `${game.away}-QB`
        );
  
        pushWithAverage(
          createPlayerRow({
            ...awayMeta,
            position: "RB",
            firstName: awayTeam.rb.split(" ").slice(0, -1).join(" "),
            lastName: awayTeam.rb.split(" ").slice(-1).join(" "),
            displayName: awayTeam.rb,
            headshotUrl: makeHeadshotUrl("RB", awayTeam.rb),
            currentScore: scorePlayer("RB", awayOffense.rbStats),
            avgScore: 0,
            overallStats: {
              rushingYards: round1(awayOffense.rbStats.rushingYards * (1.9 + week * 0.12)),
              rushingTDs: round1(awayOffense.rbStats.rushingTDs * (1.7 + week * 0.08)),
              receivedYards: round1(awayOffense.rbStats.receivedYards * (1.6 + week * 0.08)),
              receivedTDs: round1(awayOffense.rbStats.receivedTDs * (1.5 + week * 0.05)),
            },
            weeklyStats: awayOffense.rbStats,
          }),
          `${game.away}-RB`
        );
  
        pushWithAverage(
          createPlayerRow({
            ...awayMeta,
            position: "WR",
            firstName: awayTeam.wr.split(" ").slice(0, -1).join(" "),
            lastName: awayTeam.wr.split(" ").slice(-1).join(" "),
            displayName: awayTeam.wr,
            headshotUrl: makeHeadshotUrl("WR", awayTeam.wr),
            currentScore: scorePlayer("WR", awayOffense.wrStats),
            avgScore: 0,
            overallStats: {
              receivedYards: round1(awayOffense.wrStats.receivedYards * (1.8 + week * 0.12)),
              receivedTDs: round1(awayOffense.wrStats.receivedTDs * (1.6 + week * 0.05)),
            },
            weeklyStats: awayOffense.wrStats,
          }),
          `${game.away}-WR`
        );
  
        pushWithAverage(
          createPlayerRow({
            ...awayMeta,
            position: "TE",
            firstName: awayTeam.te.split(" ").slice(0, -1).join(" "),
            lastName: awayTeam.te.split(" ").slice(-1).join(" "),
            displayName: awayTeam.te,
            headshotUrl: makeHeadshotUrl("TE", awayTeam.te),
            currentScore: scorePlayer("TE", awayOffense.teStats),
            avgScore: 0,
            overallStats: {
              receivedYards: round1(awayOffense.teStats.receivedYards * (1.8 + week * 0.1)),
              receivedTDs: round1(awayOffense.teStats.receivedTDs * (1.6 + week * 0.05)),
            },
            weeklyStats: awayOffense.teStats,
          }),
          `${game.away}-TE`
        );
  
        pushWithAverage(
          createPlayerRow({
            ...awayMeta,
            position: "K",
            firstName: awayTeam.k.split(" ").slice(0, -1).join(" "),
            lastName: awayTeam.k.split(" ").slice(-1).join(" "),
            displayName: awayTeam.k,
            headshotUrl: null,
            currentScore: scorePlayer("K", awayOffense.kStats),
            avgScore: 0,
            overallStats: {
              fg0to49Yards: round1(awayOffense.kStats.fg0to49Yards * (1.8 + week * 0.08)),
              fg50plusYards: round1(Math.max(1, awayOffense.kStats.fg50plusYards * (1.4 + week * 0.05))),
              xp: round1(awayOffense.kStats.xp * (1.9 + week * 0.08)),
            },
            weeklyStats: awayOffense.kStats,
          }),
          `${game.away}-K`
        );
  
        pushWithAverage(
          createPlayerRow({
            season,
            week,
            position: "DEF",
            teamCode: game.away,
            firstName: awayTeam.name.split(" ").slice(0, -1).join(" "),
            lastName: awayTeam.name.split(" ").slice(-1).join(" "),
            displayName: awayTeam.name,
            headshotUrl: null,
            isDefense: true,
            currentScore: scorePlayer("DEF", awayDefense.weeklyStats),
            avgScore: 0,
            lastWeekOpponentTeam:
              week > 1 ? TEAM_PROFILES[matchupByWeek[week - 1][game.away]].name : null,
            opponentDefenseTeamCode: null,
            currentWeekOpponentTeam: homeTeam.name,
            currentWeekOpponentDefenseTeamCode: null,
            allowedPassingYards: awayDefense.allowedPassingYards,
            allowedRushingYards: awayDefense.allowedRushingYards,
            overallStats: {
              interception: round1(awayDefense.weeklyStats.interception * (1.9 + week * 0.08)),
              forcedFumble: round1(awayDefense.weeklyStats.forcedFumble * (1.8 + week * 0.08)),
              sack: round1(awayDefense.weeklyStats.sack * (1.8 + week * 0.08)),
              safety: round1(awayDefense.weeklyStats.safety * (1.2 + week * 0.05)),
              returnTD: round1(awayDefense.weeklyStats.returnTD * (1.3 + week * 0.05)),
              allowedPoints: round1(awayDefense.weeklyStats.allowedPoints * (0.95 + week * 0.02)),
            },
            weeklyStats: awayDefense.weeklyStats,
          }),
          `${game.away}-DEF`
        );
  
        pushWithAverage(
          createPlayerRow({
            ...homeMeta,
            position: "QB",
            firstName: homeTeam.qb.split(" ").slice(0, -1).join(" "),
            lastName: homeTeam.qb.split(" ").slice(-1).join(" "),
            displayName: homeTeam.qb,
            headshotUrl: makeHeadshotUrl("QB", homeTeam.qb),
            currentScore: scorePlayer("QB", homeOffense.qbStats),
            avgScore: 0,
            overallStats: {
              passingYards: round1(homeOffense.qbStats.passingYards * (1.8 + week * 0.15)),
              passingTDs: round1(homeOffense.qbStats.passingTDs * (1.7 + week * 0.1)),
              interceptions: round1(Math.max(0, homeOffense.qbStats.interceptions * (0.8 + week * 0.05))),
              rushingYards: round1(homeOffense.qbStats.rushingYards * (1.7 + week * 0.1)),
              rushingTDs: round1(homeOffense.qbStats.rushingTDs * (1.6 + week * 0.05)),
            },
            weeklyStats: homeOffense.qbStats,
          }),
          `${game.home}-QB`
        );
  
        pushWithAverage(
          createPlayerRow({
            ...homeMeta,
            position: "RB",
            firstName: homeTeam.rb.split(" ").slice(0, -1).join(" "),
            lastName: homeTeam.rb.split(" ").slice(-1).join(" "),
            displayName: homeTeam.rb,
            headshotUrl: makeHeadshotUrl("RB", homeTeam.rb),
            currentScore: scorePlayer("RB", homeOffense.rbStats),
            avgScore: 0,
            overallStats: {
              rushingYards: round1(homeOffense.rbStats.rushingYards * (1.9 + week * 0.12)),
              rushingTDs: round1(homeOffense.rbStats.rushingTDs * (1.7 + week * 0.08)),
              receivedYards: round1(homeOffense.rbStats.receivedYards * (1.6 + week * 0.08)),
              receivedTDs: round1(homeOffense.rbStats.receivedTDs * (1.5 + week * 0.05)),
            },
            weeklyStats: homeOffense.rbStats,
          }),
          `${game.home}-RB`
        );
  
        pushWithAverage(
          createPlayerRow({
            ...homeMeta,
            position: "WR",
            firstName: homeTeam.wr.split(" ").slice(0, -1).join(" "),
            lastName: homeTeam.wr.split(" ").slice(-1).join(" "),
            displayName: homeTeam.wr,
            headshotUrl: makeHeadshotUrl("WR", homeTeam.wr),
            currentScore: scorePlayer("WR", homeOffense.wrStats),
            avgScore: 0,
            overallStats: {
              receivedYards: round1(homeOffense.wrStats.receivedYards * (1.8 + week * 0.12)),
              receivedTDs: round1(homeOffense.wrStats.receivedTDs * (1.6 + week * 0.05)),
            },
            weeklyStats: homeOffense.wrStats,
          }),
          `${game.home}-WR`
        );
  
        pushWithAverage(
          createPlayerRow({
            ...homeMeta,
            position: "TE",
            firstName: homeTeam.te.split(" ").slice(0, -1).join(" "),
            lastName: homeTeam.te.split(" ").slice(-1).join(" "),
            displayName: homeTeam.te,
            headshotUrl: makeHeadshotUrl("TE", homeTeam.te),
            currentScore: scorePlayer("TE", homeOffense.teStats),
            avgScore: 0,
            overallStats: {
              receivedYards: round1(homeOffense.teStats.receivedYards * (1.8 + week * 0.1)),
              receivedTDs: round1(homeOffense.teStats.receivedTDs * (1.6 + week * 0.05)),
            },
            weeklyStats: homeOffense.teStats,
          }),
          `${game.home}-TE`
        );
  
        pushWithAverage(
          createPlayerRow({
            ...homeMeta,
            position: "K",
            firstName: homeTeam.k.split(" ").slice(0, -1).join(" "),
            lastName: homeTeam.k.split(" ").slice(-1).join(" "),
            displayName: homeTeam.k,
            headshotUrl: null,
            currentScore: scorePlayer("K", homeOffense.kStats),
            avgScore: 0,
            overallStats: {
              fg0to49Yards: round1(homeOffense.kStats.fg0to49Yards * (1.8 + week * 0.08)),
              fg50plusYards: round1(Math.max(1, homeOffense.kStats.fg50plusYards * (1.4 + week * 0.05))),
              xp: round1(homeOffense.kStats.xp * (1.9 + week * 0.08)),
            },
            weeklyStats: homeOffense.kStats,
          }),
          `${game.home}-K`
        );
  
        pushWithAverage(
          createPlayerRow({
            season,
            week,
            position: "DEF",
            teamCode: game.home,
            firstName: homeTeam.name.split(" ").slice(0, -1).join(" "),
            lastName: homeTeam.name.split(" ").slice(-1).join(" "),
            displayName: homeTeam.name,
            headshotUrl: null,
            isDefense: true,
            currentScore: scorePlayer("DEF", homeDefense.weeklyStats),
            avgScore: 0,
            lastWeekOpponentTeam:
              week > 1 ? TEAM_PROFILES[matchupByWeek[week - 1][game.home]].name : null,
            opponentDefenseTeamCode: null,
            currentWeekOpponentTeam: awayTeam.name,
            currentWeekOpponentDefenseTeamCode: null,
            allowedPassingYards: homeDefense.allowedPassingYards,
            allowedRushingYards: homeDefense.allowedRushingYards,
            overallStats: {
              interception: round1(homeDefense.weeklyStats.interception * (1.9 + week * 0.08)),
              forcedFumble: round1(homeDefense.weeklyStats.forcedFumble * (1.8 + week * 0.08)),
              sack: round1(homeDefense.weeklyStats.sack * (1.8 + week * 0.08)),
              safety: round1(homeDefense.weeklyStats.safety * (1.2 + week * 0.05)),
              returnTD: round1(homeDefense.weeklyStats.returnTD * (1.3 + week * 0.05)),
              allowedPoints: round1(homeDefense.weeklyStats.allowedPoints * (0.95 + week * 0.02)),
            },
            weeklyStats: homeDefense.weeklyStats,
          }),
          `${game.home}-DEF`
        );
      });
    }
  
    return { games, players, matchupByWeek };
  }
  
  const built = buildPerfectChallengeTestData(new Date());
  
  export const perfectChallengePlayers = built.players;
  export const perfectChallengeGames = built.games;
  export default perfectChallengePlayers;