-- AlterTable
ALTER TABLE "media" ADD COLUMN     "chat_id" TEXT;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
