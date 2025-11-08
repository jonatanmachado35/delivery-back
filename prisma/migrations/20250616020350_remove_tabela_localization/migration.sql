/*
  Warnings:

  - You are about to drop the column `localizationId` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the `localizations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `localization` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_localizationId_fkey";

-- DropForeignKey
ALTER TABLE "localizations" DROP CONSTRAINT "localizations_deliveryId_fkey";

-- DropIndex
DROP INDEX "location_idx";

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "localizationId",
DROP COLUMN "location",
ADD COLUMN     "localization" geography(Point, 4326) NOT NULL;

-- DropTable
DROP TABLE "localizations";

-- CreateIndex
CREATE INDEX "location_idx" ON "addresses" USING GIST ("localization");
