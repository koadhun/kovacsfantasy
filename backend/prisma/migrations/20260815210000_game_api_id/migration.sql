-- AlterTable
ALTER TABLE "Game" ADD COLUMN "apiGameId" INTEGER;

-- CreateIndex
CREATE INDEX "Game_apiGameId_idx" ON "Game"("apiGameId");