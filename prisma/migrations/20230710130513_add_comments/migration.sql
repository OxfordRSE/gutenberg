-- CreateTable
CREATE TABLE "CommentThread" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "groupId" INTEGER,
    "section" TEXT NOT NULL DEFAULT '',
    "problemTag" TEXT NOT NULL DEFAULT '',
    "textRef" TEXT NOT NULL DEFAULT '',
    "textRefStart" INTEGER NOT NULL DEFAULT 0,
    "textRefEnd" INTEGER NOT NULL DEFAULT 0,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByEmail" TEXT NOT NULL,

    CONSTRAINT "CommentThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "threadId" INTEGER NOT NULL,
    "markdown" TEXT NOT NULL DEFAULT '',
    "index" INTEGER NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByEmail" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommentThread" ADD CONSTRAINT "CommentThread_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentThread" ADD CONSTRAINT "CommentThread_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "EventGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentThread" ADD CONSTRAINT "CommentThread_createdByEmail_fkey" FOREIGN KEY ("createdByEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "CommentThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_createdByEmail_fkey" FOREIGN KEY ("createdByEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
