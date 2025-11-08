/*
  Warnings:

  - You are about to drop the column `addressId` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `info` on the `deliveries` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `deliverymen` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyId` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_client_address` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_origin_address` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `information` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `deliveries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "deliveries" DROP CONSTRAINT "deliveries_addressId_fkey";

-- DropIndex
DROP INDEX "deliveries_addressId_key";

-- AlterTable
ALTER TABLE "deliveries" DROP COLUMN "addressId",
DROP COLUMN "info",
ADD COLUMN     "companyId" INTEGER NOT NULL,
ADD COLUMN     "email" VARCHAR(250) NOT NULL,
ADD COLUMN     "id_client_address" INTEGER NOT NULL,
ADD COLUMN     "id_origin_address" INTEGER NOT NULL,
ADD COLUMN     "information" TEXT NOT NULL,
ADD COLUMN     "isFragile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telefone" VARCHAR(30) NOT NULL,
ALTER COLUMN "width" DROP NOT NULL,
ALTER COLUMN "length" DROP NOT NULL,
ALTER COLUMN "weight" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "height" DROP NOT NULL;

-- AlterTable
ALTER TABLE "vehicles" ALTER COLUMN "brand" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "model" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "year" SET DATA TYPE VARCHAR(4),
ALTER COLUMN "color" SET DATA TYPE VARCHAR(20);

-- CreateTable
CREATE TABLE "routes" (
    "id" SERIAL NOT NULL,
    "coord" geography(Point, 4326) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryId" INTEGER,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deliverymen_cpf_key" ON "deliverymen"("cpf");

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_id_client_address_fkey" FOREIGN KEY ("id_client_address") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_id_origin_address_fkey" FOREIGN KEY ("id_origin_address") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
