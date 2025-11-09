-- CreateEnum
CREATE TYPE "DeliverymanDocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "deliveryman_documents" (
    "id" SERIAL NOT NULL,
    "deliveryman_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" "DeliverymanDocumentStatus" NOT NULL DEFAULT 'PENDING',
    "file_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliveryman_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deliveryman_documents_file_id_key" ON "deliveryman_documents"("file_id");

-- AddForeignKey
ALTER TABLE "deliveryman_documents" ADD CONSTRAINT "deliveryman_documents_deliveryman_id_fkey" FOREIGN KEY ("deliveryman_id") REFERENCES "deliverymen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveryman_documents" ADD CONSTRAINT "deliveryman_documents_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

