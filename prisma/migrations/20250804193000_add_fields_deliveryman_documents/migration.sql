-- AlterTable
ALTER TABLE "deliveryman_documents"
ADD COLUMN     "document_number" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "full_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "cpf" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "cnh_type" TEXT;
