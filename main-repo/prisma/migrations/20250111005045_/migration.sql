/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `user_profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `about` to the `user_profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `user_profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_profile" ADD COLUMN     "about" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_phone_key" ON "user_profile"("phone");
