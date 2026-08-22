-- CreateTable
CREATE TABLE "Injury" (
    "id" TEXT NOT NULL,
    "apiPlayerId" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "headshotUrl" TEXT,
    "teamCode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Injury_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Injury_apiPlayerId_key" ON "Injury"("apiPlayerId");

-- CreateIndex
CREATE INDEX "Injury_teamCode_idx" ON "Injury"("teamCode");