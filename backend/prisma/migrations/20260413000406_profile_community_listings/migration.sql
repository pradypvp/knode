-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "interests" JSONB,
ADD COLUMN     "projects" JSONB,
ADD COLUMN     "year" INTEGER;

-- CreateTable
CREATE TABLE "CommunityListing" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "theme" TEXT,
    "stack" TEXT[],
    "openSlots" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityListing_category_createdAt_idx" ON "CommunityListing"("category", "createdAt");

-- AddForeignKey
ALTER TABLE "CommunityListing" ADD CONSTRAINT "CommunityListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
