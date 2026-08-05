-- CreateEnum
CREATE TYPE "PerfectChallengeSlot" AS ENUM ('QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'K', 'DEF');

-- CreateEnum
CREATE TYPE "PlayoffChallengeRound" AS ENUM ('WILDCARD', 'DIVISIONAL', 'CONFERENCE', 'SUPER_BOWL');

-- CreateTable
CREATE TABLE "PerfectChallengePlayer" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "teamCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT,
    "headshotUrl" TEXT,
    "isDefense" BOOLEAN NOT NULL DEFAULT false,
    "currentScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastWeekOpponentTeam" TEXT,
    "opponentDefenseTeamCode" TEXT,
    "currentWeekOpponentTeam" TEXT,
    "currentWeekOpponentDefenseTeamCode" TEXT,
    "allowedPassingYards" DOUBLE PRECISION,
    "allowedRushingYards" DOUBLE PRECISION,
    "overallStats" JSONB NOT NULL,
    "weeklyStats" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerfectChallengePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfectChallengeRoster" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerfectChallengeRoster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfectChallengeRosterSlot" (
    "id" TEXT NOT NULL,
    "rosterId" TEXT NOT NULL,
    "slot" "PerfectChallengeSlot" NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerfectChallengeRosterSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayoffChallengePlayer" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "round" "PlayoffChallengeRound" NOT NULL,
    "playerKey" TEXT NOT NULL,
    "gameId" TEXT,
    "position" TEXT NOT NULL,
    "teamCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT,
    "headshotUrl" TEXT,
    "isDefense" BOOLEAN NOT NULL DEFAULT false,
    "currentScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastWeekOpponentTeam" TEXT,
    "opponentDefenseTeamCode" TEXT,
    "currentWeekOpponentTeam" TEXT,
    "currentWeekOpponentDefenseTeamCode" TEXT,
    "allowedPassingYards" DOUBLE PRECISION,
    "allowedRushingYards" DOUBLE PRECISION,
    "overallStats" JSONB NOT NULL,
    "weeklyStats" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayoffChallengePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayoffChallengeRoster" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "round" "PlayoffChallengeRound" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayoffChallengeRoster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayoffChallengeRosterSlot" (
    "id" TEXT NOT NULL,
    "rosterId" TEXT NOT NULL,
    "slot" "PerfectChallengeSlot" NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayoffChallengeRosterSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PerfectChallengePlayer_season_week_position_idx" ON "PerfectChallengePlayer"("season", "week", "position");

-- CreateIndex
CREATE INDEX "PerfectChallengePlayer_teamCode_idx" ON "PerfectChallengePlayer"("teamCode");

-- CreateIndex
CREATE UNIQUE INDEX "PerfectChallengeRoster_userId_season_week_key" ON "PerfectChallengeRoster"("userId", "season", "week");

-- CreateIndex
CREATE INDEX "PerfectChallengeRoster_season_week_idx" ON "PerfectChallengeRoster"("season", "week");

-- CreateIndex
CREATE UNIQUE INDEX "PerfectChallengeRosterSlot_rosterId_slot_key" ON "PerfectChallengeRosterSlot"("rosterId", "slot");

-- CreateIndex
CREATE INDEX "PerfectChallengeRosterSlot_playerId_idx" ON "PerfectChallengeRosterSlot"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayoffChallengePlayer_season_round_playerKey_key" ON "PlayoffChallengePlayer"("season", "round", "playerKey");

-- CreateIndex
CREATE INDEX "PlayoffChallengePlayer_season_round_position_idx" ON "PlayoffChallengePlayer"("season", "round", "position");

-- CreateIndex
CREATE INDEX "PlayoffChallengePlayer_teamCode_idx" ON "PlayoffChallengePlayer"("teamCode");

-- CreateIndex
CREATE INDEX "PlayoffChallengePlayer_playerKey_idx" ON "PlayoffChallengePlayer"("playerKey");

-- CreateIndex
CREATE INDEX "PlayoffChallengePlayer_gameId_idx" ON "PlayoffChallengePlayer"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayoffChallengeRoster_userId_season_round_key" ON "PlayoffChallengeRoster"("userId", "season", "round");

-- CreateIndex
CREATE INDEX "PlayoffChallengeRoster_season_round_idx" ON "PlayoffChallengeRoster"("season", "round");

-- CreateIndex
CREATE UNIQUE INDEX "PlayoffChallengeRosterSlot_rosterId_slot_key" ON "PlayoffChallengeRosterSlot"("rosterId", "slot");

-- CreateIndex
CREATE INDEX "PlayoffChallengeRosterSlot_playerId_idx" ON "PlayoffChallengeRosterSlot"("playerId");

-- AddForeignKey
ALTER TABLE "PerfectChallengeRoster" ADD CONSTRAINT "PerfectChallengeRoster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfectChallengeRosterSlot" ADD CONSTRAINT "PerfectChallengeRosterSlot_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "PerfectChallengeRoster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfectChallengeRosterSlot" ADD CONSTRAINT "PerfectChallengeRosterSlot_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PerfectChallengePlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayoffChallengePlayer" ADD CONSTRAINT "PlayoffChallengePlayer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayoffChallengeRoster" ADD CONSTRAINT "PlayoffChallengeRoster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayoffChallengeRosterSlot" ADD CONSTRAINT "PlayoffChallengeRosterSlot_rosterId_fkey" FOREIGN KEY ("rosterId") REFERENCES "PlayoffChallengeRoster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayoffChallengeRosterSlot" ADD CONSTRAINT "PlayoffChallengeRosterSlot_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayoffChallengePlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;