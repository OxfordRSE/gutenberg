-- DropForeignKey
ALTER TABLE "EventItem" DROP CONSTRAINT "EventItem_groupId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "EventItem" ADD CONSTRAINT "EventItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "EventGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
