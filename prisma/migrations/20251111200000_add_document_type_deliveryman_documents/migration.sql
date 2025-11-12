DO $$
BEGIN
  CREATE TYPE "DeliverymanDocumentType" AS ENUM ('RG', 'CNH');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE IF EXISTS "deliveryman_documents"
  ADD COLUMN IF NOT EXISTS "document_type" "DeliverymanDocumentType";
