-- AlterTable
ALTER TABLE "SOSRequest" ADD COLUMN     "pickedByUserId" TEXT;

-- CreateTable
CREATE TABLE "SosChatMessage" (
    "id" TEXT NOT NULL,
    "sosId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SosChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SosChatMessage_sosId_createdAt_idx" ON "SosChatMessage"("sosId", "createdAt");

-- CreateIndex
CREATE INDEX "SOSRequest_pickedByUserId_idx" ON "SOSRequest"("pickedByUserId");

-- AddForeignKey
ALTER TABLE "SOSRequest" ADD CONSTRAINT "SOSRequest_pickedByUserId_fkey" FOREIGN KEY ("pickedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SosChatMessage" ADD CONSTRAINT "SosChatMessage_sosId_fkey" FOREIGN KEY ("sosId") REFERENCES "SOSRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SosChatMessage" ADD CONSTRAINT "SosChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
