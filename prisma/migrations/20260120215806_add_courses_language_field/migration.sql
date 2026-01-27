-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "language" TEXT[] DEFAULT ARRAY[]::TEXT[];
