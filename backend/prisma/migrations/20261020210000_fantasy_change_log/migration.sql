-- CreateTable
CREATE TABLE IF NOT EXISTS "FantasyChangeLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "week" INTEGER,
    "round" TEXT,
    "target" TEXT NOT NULL,
    "targetId" TEXT,
    "previousValue" TEXT,
    "previousId" TEXT,
    "newValue" TEXT NOT NULL,
    "newId" TEXT,
    "meta" JSONB,

    CONSTRAINT "FantasyChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FantasyChangeLog_createdAt_idx" ON "FantasyChangeLog"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FantasyChangeLog_userId_createdAt_idx" ON "FantasyChangeLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FantasyChangeLog_game_season_week_idx" ON "FantasyChangeLog"("game", "season", "week");
