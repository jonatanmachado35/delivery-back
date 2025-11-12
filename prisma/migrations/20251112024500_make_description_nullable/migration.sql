ALTER TABLE IF EXISTS "deliveryman_documents"
  ALTER COLUMN "description" DROP NOT NULL,
  ALTER COLUMN "description" DROP DEFAULT;
