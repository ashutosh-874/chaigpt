-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "branchedFromMessageId" TEXT,
ADD COLUMN     "parentConversationId" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "parentMessageId" TEXT;

-- CreateIndex
CREATE INDEX "Conversation_parentConversationId_idx" ON "Conversation"("parentConversationId");

-- CreateIndex
CREATE INDEX "Conversation_branchedFromMessageId_idx" ON "Conversation"("branchedFromMessageId");

-- CreateIndex
CREATE INDEX "Message_parentMessageId_idx" ON "Message"("parentMessageId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_parentConversationId_fkey" FOREIGN KEY ("parentConversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
