/*
  Warnings:

  - A unique constraint covering the columns `[reportId,userId]` on the table `RewardTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "WasteType" AS ENUM ('LITTER', 'BIN_OVERFLOW', 'GARBAGE_PILE', 'DRAIN_BLOCK', 'BULK_DUMP');

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_cleaningTeamId_fkey";

-- DropIndex
DROP INDEX "RewardTransaction_reportId_key";

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "cleanerId" TEXT,
ALTER COLUMN "cleaningTeamId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "wasteType" "WasteType" NOT NULL DEFAULT 'LITTER';

-- CreateIndex
CREATE UNIQUE INDEX "RewardTransaction_reportId_userId_key" ON "RewardTransaction"("reportId", "userId");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_cleaningTeamId_fkey" FOREIGN KEY ("cleaningTeamId") REFERENCES "CleaningTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_cleanerId_fkey" FOREIGN KEY ("cleanerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
