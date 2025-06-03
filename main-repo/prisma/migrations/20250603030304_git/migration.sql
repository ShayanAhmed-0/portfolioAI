/*
  Warnings:

  - The primary key for the `git_user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `two_factor_authentication` on the `git_user` table. All the data in the column will be lost.
  - You are about to drop the column `user_profile_id` on the `repos` table. All the data in the column will be lost.
  - Added the required column `url` to the `git_user` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `git_user` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "repos" DROP CONSTRAINT "repos_user_profile_id_fkey";

-- AlterTable
ALTER TABLE "git_user" DROP CONSTRAINT "git_user_pkey",
DROP COLUMN "two_factor_authentication",
ADD COLUMN     "url" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "git_user_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "repos" DROP COLUMN "user_profile_id",
ADD COLUMN     "git_user_id" INTEGER;

-- AddForeignKey
ALTER TABLE "repos" ADD CONSTRAINT "repos_git_user_id_fkey" FOREIGN KEY ("git_user_id") REFERENCES "git_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
