-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('private', 'public');

-- AlterTable
ALTER TABLE "user_profile" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'public';
