/*
  Warnings:

  - Changed the type of `date_of_birth` on the `deliverymen` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'NO_DOCUMENTS';

-- AlterTable
ALTER TABLE "deliverymen" DROP COLUMN "date_of_birth",
ADD COLUMN     "date_of_birth" DATE NOT NULL;
