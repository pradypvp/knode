CREATE TYPE "SOSStatus" AS ENUM ('OPEN', 'PICKED', 'CLOSED');

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "credibilityScore" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "karmaBalance" INTEGER NOT NULL DEFAULT 100;

CREATE TABLE "UserSkill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "proficiency" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserSkill_userId_skill_key" ON "UserSkill"("userId", "skill");
CREATE INDEX "UserSkill_skill_idx" ON "UserSkill"("skill");

ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "KarmaLedgerEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "counterpartyId" TEXT,
    "correlationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KarmaLedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "KarmaLedgerEntry_userId_correlationId_key" ON "KarmaLedgerEntry"("userId", "correlationId");
CREATE INDEX "KarmaLedgerEntry_userId_createdAt_idx" ON "KarmaLedgerEntry"("userId", "createdAt");

ALTER TABLE "KarmaLedgerEntry" ADD CONSTRAINT "KarmaLedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "KarmaIdempotency" (
    "userId" TEXT NOT NULL,
    "clientKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KarmaIdempotency_pkey" PRIMARY KEY ("userId", "clientKey")
);

CREATE TABLE "SOSRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "bountyKarma" INTEGER NOT NULL DEFAULT 0,
    "status" "SOSStatus" NOT NULL DEFAULT 'OPEN'::"SOSStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SOSRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SOSRequest_status_createdAt_idx" ON "SOSRequest"("status", "createdAt");

ALTER TABLE "SOSRequest" ADD CONSTRAINT "SOSRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
