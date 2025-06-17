-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "review_for_id" TEXT;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_review_for_id_fkey" FOREIGN KEY ("review_for_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
