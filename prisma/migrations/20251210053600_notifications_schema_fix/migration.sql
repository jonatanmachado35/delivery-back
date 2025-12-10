-- Ajusta tabela de notificações para o novo schema sem quebrar dados existentes.

-- Adiciona colunas novas caso ainda não existam
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'PENDING' NOT NULL;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "requires_action" BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "action_status" TEXT DEFAULT 'PENDING' NOT NULL;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "link" TEXT;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "reference_key" TEXT;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "recipient_id" INTEGER;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "sender_id" INTEGER;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "action_at" TIMESTAMP;

-- Se existia a coluna antiga user_id, usa ela para preencher recipient_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'user_id'
  ) THEN
    UPDATE "notifications" n
    SET "recipient_id" = COALESCE(n."recipient_id", n."user_id")
    WHERE n."recipient_id" IS NULL;
  END IF;
END $$;

-- Complementa recipient_id com sender_id se ainda estiver nulo
UPDATE "notifications" n
SET "recipient_id" = COALESCE(n."recipient_id", n."sender_id")
WHERE n."recipient_id" IS NULL;

-- Último fallback: usa o primeiro usuário cadastrado
UPDATE "notifications" n
SET "recipient_id" = (
  SELECT id FROM "users" ORDER BY id LIMIT 1
)
WHERE n."recipient_id" IS NULL;

-- Marca recipient_id como obrigatório
ALTER TABLE "notifications" ALTER COLUMN "recipient_id" SET NOT NULL;

-- Cria índice para recipient_id
CREATE INDEX IF NOT EXISTS "notifications_recipient_idx" ON "notifications"("recipient_id");

-- Remove coluna obsoleta user_id, se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE "notifications" DROP COLUMN "user_id";
  END IF;
END $$;
