-- CreateTable
CREATE TABLE "PickEmPick" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "picked" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickEmPick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickEmWeekScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "totalGames" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PickEmWeekScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PickEmPick_userId_idx" ON "PickEmPick"("userId");

-- CreateIndex
CREATE INDEX "PickEmPick_gameId_idx" ON "PickEmPick"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "PickEmPick_userId_gameId_key" ON "PickEmPick"("userId", "gameId");

-- CreateIndex
CREATE INDEX "PickEmWeekScore_season_week_idx" ON "PickEmWeekScore"("season", "week");

-- CreateIndex
CREATE UNIQUE INDEX "PickEmWeekScore_userId_season_week_key" ON "PickEmWeekScore"("userId", "season", "week");

-- AddForeignKey
ALTER TABLE "PickEmPick" ADD CONSTRAINT "PickEmPick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickEmPick" ADD CONSTRAINT "PickEmPick_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickEmWeekScore" ADD CONSTRAINT "PickEmWeekScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
