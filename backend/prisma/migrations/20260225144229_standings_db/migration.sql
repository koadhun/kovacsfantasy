-- CreateEnum
CREATE TYPE "Conference" AS ENUM ('AFC', 'NFC');

-- CreateEnum
CREATE TYPE "ClinchFlag" AS ENUM ('x', 'y', 'z', 'STAR');

-- CreateTable
CREATE TABLE "StandingsRow" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "conference" "Conference" NOT NULL,
    "division" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "w" INTEGER NOT NULL,
    "l" INTEGER NOT NULL,
    "t" INTEGER NOT NULL,
    "pct" DOUBLE PRECISION NOT NULL,
    "pf" INTEGER NOT NULL,
    "pa" INTEGER NOT NULL,
    "net" INTEGER NOT NULL,
    "clinched" "ClinchFlag"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StandingsRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StandingsRow_season_conference_idx" ON "StandingsRow"("season", "conference");

-- CreateIndex
CREATE INDEX "StandingsRow_season_conference_division_idx" ON "StandingsRow"("season", "conference", "division");

-- CreateIndex
CREATE UNIQUE INDEX "StandingsRow_season_conference_division_team_key" ON "StandingsRow"("season", "conference", "division", "team");
