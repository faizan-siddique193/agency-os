/*
  Warnings:

  - You are about to drop the column `onboardingCompleted` on the `User` table. All the data in the column will be lost.
  - The `onboardingStep` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "onboardingCompleted",
DROP COLUMN "onboardingStep",
ADD COLUMN     "onboardingStep" "OnboardingStep" NOT NULL DEFAULT 'WORKSPACE';
