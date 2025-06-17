-- DropForeignKey
ALTER TABLE "git_user" DROP CONSTRAINT "git_user_user_profile_id_fkey";

-- DropIndex
DROP INDEX "reviews_user_profile_id_key";

-- AlterTable
ALTER TABLE "git_user" ALTER COLUMN "user_profile_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "git_user" ADD CONSTRAINT "git_user_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
