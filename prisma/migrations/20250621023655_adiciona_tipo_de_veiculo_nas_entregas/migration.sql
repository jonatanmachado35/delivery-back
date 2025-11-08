/*
  Warnings:

  - Added the required column `vehicleType` to the `deliveries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "deliveries" ADD COLUMN     "vehicleType" TEXT NOT NULL;
