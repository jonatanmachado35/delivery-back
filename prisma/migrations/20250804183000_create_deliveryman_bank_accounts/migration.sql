-- CreateEnum
CREATE TYPE "DeliverymanBankAccountType" AS ENUM ('CHECKING', 'SAVINGS', 'PAYMENT');

-- CreateEnum
CREATE TYPE "PixKeyType" AS ENUM ('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'EVP');

-- CreateTable
CREATE TABLE "deliveryman_bank_accounts" (
    "id" SERIAL NOT NULL,
    "deliveryman_id" INTEGER NOT NULL,
    "bank_code" TEXT,
    "bank_name" TEXT NOT NULL,
    "agency" TEXT NOT NULL,
    "agency_digit" TEXT,
    "account" TEXT NOT NULL,
    "account_digit" TEXT,
    "account_type" "DeliverymanBankAccountType" NOT NULL,
    "holder_name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "pix_key" TEXT,
    "pix_key_type" "PixKeyType",
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliveryman_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deliveryman_bank_account_deliveryman_idx" ON "deliveryman_bank_accounts"("deliveryman_id");

-- AddForeignKey
ALTER TABLE "deliveryman_bank_accounts"
ADD CONSTRAINT "deliveryman_bank_accounts_deliveryman_id_fkey"
FOREIGN KEY ("deliveryman_id") REFERENCES "deliverymen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
