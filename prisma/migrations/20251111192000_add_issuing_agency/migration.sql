DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'deliveryman_documents'
  ) THEN
    ALTER TABLE "deliveryman_documents"
    ADD COLUMN IF NOT EXISTS "issuing_agency" TEXT;
  END IF;
END $$;
