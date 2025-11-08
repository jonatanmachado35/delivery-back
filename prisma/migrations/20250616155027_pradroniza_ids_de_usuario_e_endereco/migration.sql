/*
  Warnings:

  - You are about to drop the column `idUser` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `addressId` on the `deliverymen` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `deliverymen` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idAddress]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_user]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[addressId]` on the table `deliveries` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_user]` on the table `deliverymen` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idAddress]` on the table `deliverymen` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_user` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idAddress` to the `deliverymen` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_user` to the `deliverymen` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_idUser_fkey";

-- DropForeignKey
ALTER TABLE "deliverymen" DROP CONSTRAINT "deliverymen_addressId_fkey";

-- DropForeignKey
ALTER TABLE "deliverymen" DROP CONSTRAINT "deliverymen_userId_fkey";

-- DropIndex
DROP INDEX "companies_idUser_key";

-- DropIndex
DROP INDEX "deliverymen_addressId_key";

-- DropIndex
DROP INDEX "deliverymen_userId_key";

-- AlterTable
ALTER TABLE "addresses" ALTER COLUMN "country" SET DEFAULT 'Brasil';

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "idUser",
ADD COLUMN     "id_user" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "deliverymen" DROP COLUMN "addressId",
DROP COLUMN "userId",
ADD COLUMN     "idAddress" INTEGER NOT NULL,
ADD COLUMN     "id_user" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "companies_idAddress_key" ON "companies"("idAddress");

-- CreateIndex
CREATE UNIQUE INDEX "companies_id_user_key" ON "companies"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_addressId_key" ON "deliveries"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "deliverymen_id_user_key" ON "deliverymen"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "deliverymen_idAddress_key" ON "deliverymen"("idAddress");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverymen" ADD CONSTRAINT "deliverymen_idAddress_fkey" FOREIGN KEY ("idAddress") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverymen" ADD CONSTRAINT "deliverymen_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
