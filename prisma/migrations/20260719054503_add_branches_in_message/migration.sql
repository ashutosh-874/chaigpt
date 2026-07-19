-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_branchedFromMessageId_fkey" FOREIGN KEY ("branchedFromMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
