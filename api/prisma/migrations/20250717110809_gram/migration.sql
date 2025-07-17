/*
  Warnings:

  - Added the required column `gram` to the `Medicine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN "gram" INTEGER DEFAULT 0;

