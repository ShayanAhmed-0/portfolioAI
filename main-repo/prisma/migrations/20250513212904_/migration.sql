/*
  Warnings:

  - You are about to drop the column `age` on the `user_profile` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `user_profile` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `user_profile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_profile_phone_key";

-- AlterTable
ALTER TABLE "user_profile" DROP COLUMN "age",
DROP COLUMN "gender",
DROP COLUMN "phone";
