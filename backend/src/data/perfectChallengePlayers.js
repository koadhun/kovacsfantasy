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
      { away: "DET", home: "GB" },
      { away: "BUF", home: "MIA" },
      { away: "NE", home: "NYJ" },
      { away: "TB", home: "NO" },
      { away: "CAR", home: "LAC" },
      { away: "ARI", home: "LAR" },
      { away: "JAX", home: "HOU" },
      { away: "PIT", home: "DEN" },
      { away: "TEN", home: "CHI" },
      { away: "LV", home: "WAS" },
      { away: "MIN", home: "IND" },
      { away: "DAL", home: "CLE" },
      { away: "PHI", home: "ATL" },
      { away: "SF", home: "SEA" },
      { away: "KC", home: "NYG" },
    ],
    3: [
      { away: "BAL", home: "BUF" },
      { away: "DET", home: "MIN" },
      { away: "MIA", home: "NYJ" },
      { away: "PHI", home: "DAL" },
      { away: "CIN", home: "KC" },
      { away: "ATL", home: "TB" },
      { away: "HOU", home: "IND" },
      { away: "SF", home: "LAR" },
      { away: "SEA", home: "ARI" },
      { away: "NO", home: "CAR" },
      { away: "CLE", home: "PIT" },
      { away: "GB", home: "CHI" },
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
  
  function splitName(fullName) {
    const parts = String(fullName).trim().split(" ");
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return {
      firstName: parts.slice(0, -1).join(" "),
      lastName: parts.slice(-1).join(" "),
    };
  }
  
  function makeAvatarUrl(playerName) {
    const name = encodeURIComponent(playerName);
    return `https://ui-avatars.com/api/?name=${name}&background=0b1738&color=ffffff&size=256&bold=true`;
  }
  
  function getLastWeekOpponentName(teamCode, week) {
    if (week <= 1) return null;
    const previousOpponentCode = matchupByWeek?.[week - 1]?.[teamCode];
    if (!previousOpponentCode) return null;
    return TEAM_PROFILES[previousOpponentCode]?.name || null;
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
  
    const qbRushShare = round1(
      clamp(
        18 +
          week * 3 +
          (teamCode === "BAL" || teamCode === "ARI" || teamCode === "PHI" ? 18 : 0),
        8,
        58
      )
    );
    const rbRushShare = round1(clamp(rushingYards * 0.72, 48, 132));
    const wrRushShare = round1(clamp(rushingYards * 0.1, 0, 22));
    const teRushShare = round1(
      clamp(rushingYards - qbRushShare - rbRushShare - wrRushShare, 0, 16)
    );
  
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
      rushingTDs:
        teamCode === "BAL" || teamCode === "PHI" || teamCode === "ARI"
          ? Math.min(1, rushingTDs)
          : 0,
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
    const forcedFumble = clampInt(
      1 + pressure / 26 + (week % 3 === 0 ? 1 : 0),
      0,
      3
    );
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
      base.setHours(19 + (gameIndex % 3), 0, 0, 0);
      return {
        kickoffAt: new Date(base),
        started: true,
        final: true,
      };
    }
  
    if (week === 2) {
      base.setDate(base.getDate() - 10 + gameIndex);
      base.setHours(18 + (gameIndex % 4), 0, 0, 0);
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
  
  function scaleStats(stats, multipliers) {
    const out = {};
    for (const [key, value] of Object.entries(stats)) {
      const factor = multipliers[key] ?? 1.8;
      out[key] = round1((value || 0) * factor);
    }
    return out;
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
  
    const addSkillPlayers = (teamCode, opponentCode, week, offenseBox) => {
      const team = TEAM_PROFILES[teamCode];
      const opponent = TEAM_PROFILES[opponentCode];
      const meta = {
        season,
        week,
        teamCode,
        lastWeekOpponentTeam: getLastWeekOpponentName(teamCode, week),
        opponentDefenseTeamCode: opponentCode,
        currentWeekOpponentTeam: opponent.name,
        currentWeekOpponentDefenseTeamCode: opponentCode,
      };
  
      const qbName = splitName(team.qb);
      pushWithAverage(
        createPlayerRow({
          ...meta,
          position: "QB",
          ...qbName,
          displayName: team.qb,
          headshotUrl: makeAvatarUrl(team.qb),
          currentScore: scorePlayer("QB", offenseBox.qbStats),
          avgScore: 0,
          overallStats: scaleStats(offenseBox.qbStats, {
            passingYards: 1.95 + week * 0.08,
            passingTDs: 1.7 + week * 0.08,
            interceptions: 0.9 + week * 0.03,
            rushingYards: 1.7 + week * 0.06,
            rushingTDs: 1.55 + week * 0.04,
            fumble: 1.2,
          }),
          weeklyStats: offenseBox.qbStats,
        }),
        `${teamCode}-QB`
      );
  
      const rbName = splitName(team.rb);
      pushWithAverage(
        createPlayerRow({
          ...meta,
          position: "RB",
          ...rbName,
          displayName: team.rb,
          headshotUrl: makeAvatarUrl(team.rb),
          currentScore: scorePlayer("RB", offenseBox.rbStats),
          avgScore: 0,
          overallStats: scaleStats(offenseBox.rbStats, {
            rushingYards: 1.9 + week * 0.08,
            rushingTDs: 1.65 + week * 0.05,
            receivedYards: 1.6 + week * 0.05,
            receivedTDs: 1.45 + week * 0.04,
            fumble: 1.15,
          }),
          weeklyStats: offenseBox.rbStats,
        }),
        `${teamCode}-RB`
      );
  
      const wrName = splitName(team.wr);
      pushWithAverage(
        createPlayerRow({
          ...meta,
          position: "WR",
          ...wrName,
          displayName: team.wr,
          headshotUrl: makeAvatarUrl(team.wr),
          currentScore: scorePlayer("WR", offenseBox.wrStats),
          avgScore: 0,
          overallStats: scaleStats(offenseBox.wrStats, {
            receivedYards: 1.85 + week * 0.07,
            receivedTDs: 1.55 + week * 0.04,
            rushingYards: 1.2,
            rushingTDs: 1.1,
            fumbles: 1.1,
          }),
          weeklyStats: offenseBox.wrStats,
        }),
        `${teamCode}-WR`
      );
  
      const teName = splitName(team.te);
      pushWithAverage(
        createPlayerRow({
          ...meta,
          position: "TE",
          ...teName,
          displayName: team.te,
          headshotUrl: makeAvatarUrl(team.te),
          currentScore: scorePlayer("TE", offenseBox.teStats),
          avgScore: 0,
          overallStats: scaleStats(offenseBox.teStats, {
            receivedYards: 1.8 + week * 0.06,
            receivedTDs: 1.5 + week * 0.04,
            rushingYards: 1.1,
            rushingTDs: 1.1,
            fumbles: 1.1,
          }),
          weeklyStats: offenseBox.teStats,
        }),
        `${teamCode}-TE`
      );
  
      const kName = splitName(team.k);
      pushWithAverage(
        createPlayerRow({
          ...meta,
          position: "K",
          ...kName,
          displayName: team.k,
          headshotUrl: null,
          currentScore: scorePlayer("K", offenseBox.kStats),
          avgScore: 0,
          overallStats: scaleStats(offenseBox.kStats, {
            fg0to49Yards: 1.8 + week * 0.06,
            fg50plusYards: 1.35 + week * 0.04,
            xp: 1.9 + week * 0.07,
          }),
          weeklyStats: offenseBox.kStats,
        }),
        `${teamCode}-K`
      );
    };
  
    const addDefensePlayer = (teamCode, opponentCode, week, defenseBox) => {
      const team = TEAM_PROFILES[teamCode];
      const opponent = TEAM_PROFILES[opponentCode];
      const teamName = splitName(team.name);
  
      pushWithAverage(
        createPlayerRow({
          season,
          week,
          position: "DEF",
          teamCode,
          ...teamName,
          displayName: team.name,
          headshotUrl: null,
          isDefense: true,
          currentScore: scorePlayer("DEF", defenseBox.weeklyStats),
          avgScore: 0,
          lastWeekOpponentTeam: getLastWeekOpponentName(teamCode, week),
          opponentDefenseTeamCode: null,
          currentWeekOpponentTeam: opponent.name,
          currentWeekOpponentDefenseTeamCode: null,
          allowedPassingYards: defenseBox.allowedPassingYards,
          allowedRushingYards: defenseBox.allowedRushingYards,
          overallStats: scaleStats(defenseBox.weeklyStats, {
            interception: 1.85 + week * 0.05,
            forcedFumble: 1.75 + week * 0.05,
            sack: 1.8 + week * 0.05,
            safety: 1.2,
            returnTD: 1.2,
            allowedPoints: 1,
          }),
          weeklyStats: defenseBox.weeklyStats,
        }),
        `${teamCode}-DEF`
      );
    };
  
    for (const [weekKey, schedule] of Object.entries(WEEKLY_SCHEDULE)) {
      const week = Number(weekKey);
  
      schedule.forEach((game, gameIndex) => {
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
  
        addSkillPlayers(game.away, game.home, week, awayOffense);
        addDefensePlayer(game.away, game.home, week, awayDefense);
  
        addSkillPlayers(game.home, game.away, week, homeOffense);
        addDefensePlayer(game.home, game.away, week, homeDefense);
      });
    }
  
    return { games, players, matchupByWeek };
  }
  
  const built = buildPerfectChallengeTestData(new Date());
  
  export const perfectChallengePlayers = built.players;
  export const perfectChallengeGames = built.games;
  export default perfectChallengePlayers;