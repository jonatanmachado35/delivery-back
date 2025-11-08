/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `billings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "localizations" (
    "id" SERIAL NOT NULL,
    "altitude" DECIMAL(65,30) NOT NULL,
    "longetude" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryId" INTEGER,

    CONSTRAINT "localizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "billings_key_key" ON "billings"("key");

-- AddForeignKey
ALTER TABLE "localizations" ADD CONSTRAINT "localizations_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
