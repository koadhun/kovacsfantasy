-- CreateTable
CREATE TABLE "PlayerGameStat" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "apiGameId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "apiPlayerId" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "stats" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerGameStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerGameStat_season_apiGameId_category_apiPlayerId_key" ON "PlayerGameStat"("season", "apiGameId", "category", "apiPlayerId");

-- CreateIndex
CREATE INDEX "PlayerGameStat_season_category_apiPlayerId_idx" ON "PlayerGameStat"("season", "category", "apiPlayerId");

-- AlterTable
ALTER TABLE "Game" ADD COLUMN "statsSynced" BOOLEAN NOT NULL DEFAULT false;