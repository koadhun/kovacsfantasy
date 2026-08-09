-- CreateTable
CREATE TABLE "PlayerStat" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "apiPlayerId" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "stats" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStat_season_category_apiPlayerId_key" ON "PlayerStat"("season", "category", "apiPlayerId");

-- CreateIndex
CREATE INDEX "PlayerStat_season_category_idx" ON "PlayerStat"("season", "category");