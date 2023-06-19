/*
  Warnings:

  - A unique constraint covering the columns `[userEmail,tag,section]` on the table `Problem` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Problem_userEmail_tag_key";

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "section" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Problem_userEmail_tag_section_key" ON "Problem"("userEmail", "tag", "section");
