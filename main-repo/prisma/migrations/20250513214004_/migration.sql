/*
  Warnings:

  - You are about to drop the column `endDate` on the `Education` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Education` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `allowNotifications` on the `user_profile` table. All the data in the column will be lost.
  - You are about to drop the column `locationName` on the `user_profile` table. All the data in the column will be lost.
  - Added the required column `end_date` to the `Education` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Education` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `Experience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Experience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `user_profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Education" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "end_date" TEXT NOT NULL,
ADD COLUMN     "start_date" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "end_date" TEXT NOT NULL,
ADD COLUMN     "start_date" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_profile" DROP COLUMN "allowNotifications",
DROP COLUMN "locationName",
ADD COLUMN     "allow_notifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "location_name" TEXT;
