/*
  Warnings:

  - You are about to drop the column `parentMessageId` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_parentMessageId_fkey";

-- DropIndex
DROP INDEX "Message_parentMessageId_idx";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "parentMessageId";
