/*
  Warnings:

  - You are about to drop the column `email` on the `companies` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "companies_email_key";

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "email";
