/*
  Warnings:

  - You are about to drop the column `lat` on the `localizations` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `localizations` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `localizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `localizations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "localizations" DROP COLUMN "lat",
DROP COLUMN "lng",
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;
