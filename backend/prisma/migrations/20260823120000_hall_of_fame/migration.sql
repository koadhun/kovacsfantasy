-- CreateTable
CREATE TABLE "HallOfFameEntry" (
    "id" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "game" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HallOfFameEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HallOfFameEntry_season_game_rank_key" ON "HallOfFameEntry"("season", "game", "rank");

-- CreateIndex
CREATE INDEX "HallOfFameEntry_season_idx" ON "HallOfFameEntry"("season");