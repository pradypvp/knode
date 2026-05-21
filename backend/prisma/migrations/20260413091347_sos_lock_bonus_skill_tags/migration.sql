/*
  Warnings:

  - Added the required column `targetSkill` to the `SOSRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SOSRequest" ADD COLUMN     "bonusKarma" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deadlineAt" TIMESTAMP(3),
ADD COLUMN     "lockExpiresAt" TIMESTAMP(3),
ADD COLUMN     "lockHolderUserId" TEXT,
ADD COLUMN     "targetSkill" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN     "topicTag" TEXT NOT NULL DEFAULT 'general';

-- CreateIndex
CREATE INDEX "SOSRequest_targetSkill_status_createdAt_idx" ON "SOSRequest"("targetSkill", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SOSRequest_lockHolderUserId_lockExpiresAt_idx" ON "SOSRequest"("lockHolderUserId", "lockExpiresAt");
