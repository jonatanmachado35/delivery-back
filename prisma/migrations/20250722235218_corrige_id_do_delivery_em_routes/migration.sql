/*
  Warnings:

  - You are about to drop the column `deliveryId` on the `routes` table. All the data in the column will be lost.
  - You are about to drop the `localizations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "localizations" DROP CONSTRAINT "localizations_deliveryId_fkey";

-- DropForeignKey
ALTER TABLE "routes" DROP CONSTRAINT "routes_deliveryId_fkey";

-- AlterTable
ALTER TABLE "routes" DROP COLUMN "deliveryId",
ADD COLUMN     "delivery_id" INTEGER;

-- DropTable
DROP TABLE "localizations";

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
