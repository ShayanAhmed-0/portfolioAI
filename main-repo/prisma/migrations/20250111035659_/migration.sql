/*
  Warnings:

  - Changed the type of `gender` on the `user_profile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- DropForeignKey
ALTER TABLE "skills" DROP CONSTRAINT "skills_user_profile_id_fkey";

-- AlterTable
ALTER TABLE "skills" ALTER COLUMN "user_profile_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_profile" DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender" NOT NULL;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
