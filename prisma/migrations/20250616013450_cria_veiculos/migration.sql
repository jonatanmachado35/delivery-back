/*
  Warnings:

  - You are about to drop the column `createdAt` on the `vehicle_types` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerKm` on the `vehicle_types` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `vehicle_types` table. All the data in the column will be lost.
  - You are about to drop the `clients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profit_margins` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `location` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ajudante_adicional` to the `vehicle_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parada_adicional` to the `vehicle_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tarifa_base` to the `vehicle_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valor_km_adicional` to the `vehicle_types` table without a default value. This is not possible if the table is not empty.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- DropForeignKey
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_localizationId_fkey";

-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_addressId_fkey";

-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "location" geography(Point, 4326) NOT NULL,
ALTER COLUMN "complement" SET DEFAULT '',
ALTER COLUMN "localizationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "vehicle_types" DROP COLUMN "createdAt",
DROP COLUMN "pricePerKm",
DROP COLUMN "updatedAt",
ADD COLUMN     "ajudante_adicional" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "parada_adicional" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "tarifa_base" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "valor_km_adicional" DECIMAL(5,2) NOT NULL;

-- DropTable
DROP TABLE "clients";

-- DropTable
DROP TABLE "profit_margins";

-- DropEnum
DROP TYPE "OrderStatus";

-- CreateIndex
CREATE INDEX "location_idx" ON "addresses" USING GIST ("location");

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_localizationId_fkey" FOREIGN KEY ("localizationId") REFERENCES "localizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
