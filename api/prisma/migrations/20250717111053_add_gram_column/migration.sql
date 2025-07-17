/*
  Warnings:

  - Made the column `gram` on table `Medicine` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Medicine" ALTER COLUMN "gram" SET NOT NULL,
ALTER COLUMN "gram" DROP DEFAULT,
ALTER COLUMN "gram" SET DATA TYPE TEXT;
