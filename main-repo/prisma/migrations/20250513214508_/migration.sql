/*
  Warnings:

  - You are about to drop the column `professionalTitle` on the `user_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_profile" DROP COLUMN "professionalTitle",
ADD COLUMN     "professional_title" TEXT;
