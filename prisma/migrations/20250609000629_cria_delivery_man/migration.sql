/*
  Warnings:

  - You are about to drop the column `address` on the `deliverymen` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `deliverymen` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[addressId]` on the table `deliverymen` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vehicleId]` on the table `deliverymen` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `addressId` to the `deliverymen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cpf` to the `deliverymen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_of_birth` to the `deliverymen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleId` to the `deliverymen` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "deliverymen_email_key";

-- AlterTable
ALTER TABLE "deliverymen" DROP COLUMN "address",
DROP COLUMN "email",
ADD COLUMN     "addressId" INTEGER NOT NULL,
ADD COLUMN     "cpf" TEXT NOT NULL,
ADD COLUMN     "date_of_birth" TEXT NOT NULL,
ADD COLUMN     "vehicleId" INTEGER NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "license_plate" VARCHAR(8) NOT NULL,
    "brand" CHAR(30) NOT NULL,
    "model" CHAR(50) NOT NULL,
    "year" CHAR(4) NOT NULL,
    "color" CHAR(20) NOT NULL,
    "vehicle_type_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_license_plate_key" ON "vehicles"("license_plate");

-- CreateIndex
CREATE UNIQUE INDEX "deliverymen_addressId_key" ON "deliverymen"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "deliverymen_vehicleId_key" ON "deliverymen"("vehicleId");

-- AddForeignKey
ALTER TABLE "deliverymen" ADD CONSTRAINT "deliverymen_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverymen" ADD CONSTRAINT "deliverymen_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
