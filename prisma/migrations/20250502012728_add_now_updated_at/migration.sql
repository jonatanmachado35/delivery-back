/*
  Warnings:

  - You are about to drop the column `higth` on the `deliveries` table. All the data in the column will be lost.
  - You are about to drop the `adresses` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `localizationId` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - The required column `code` was added to the `clients` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `addressId` to the `deliveries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `deliveries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_idAddress_fkey";

-- DropIndex
DROP INDEX "clients_email_key";

-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "complement" TEXT,
ADD COLUMN     "localizationId" INTEGER NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "balances" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "code" TEXT NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "deliveries" DROP COLUMN "higth",
ADD COLUMN     "addressId" INTEGER NOT NULL,
ADD COLUMN     "height" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "deliverymen" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "extracts" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "localizations" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "profit_margins" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "vehicle_types" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "adresses";

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_idAddress_fkey" FOREIGN KEY ("idAddress") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_localizationId_fkey" FOREIGN KEY ("localizationId") REFERENCES "localizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
