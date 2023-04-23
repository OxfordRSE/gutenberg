-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('REQUEST', 'STUDENT', 'INSTRUCTOR', 'REJECTED');

-- AlterTable
ALTER TABLE "UserOnEvent" ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'REQUEST';
