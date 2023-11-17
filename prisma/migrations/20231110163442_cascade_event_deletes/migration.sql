-- DropForeignKey
ALTER TABLE "EventGroup" DROP CONSTRAINT "EventGroup_eventId_fkey";

-- DropForeignKey
ALTER TABLE "UserOnEvent" DROP CONSTRAINT "UserOnEvent_eventId_fkey";

-- AddForeignKey
ALTER TABLE "UserOnEvent" ADD CONSTRAINT "UserOnEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventGroup" ADD CONSTRAINT "EventGroup_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
