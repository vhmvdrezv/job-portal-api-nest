/*
  Warnings:

  - Added the required column `title` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';
