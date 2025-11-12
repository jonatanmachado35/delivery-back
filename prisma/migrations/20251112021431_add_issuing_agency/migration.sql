-- DropForeignKey
ALTER TABLE "public"."deliveryman_bank_accounts" DROP CONSTRAINT "deliveryman_bank_accounts_deliveryman_id_fkey";

-- AddForeignKey
ALTER TABLE "deliveryman_bank_accounts" ADD CONSTRAINT "deliveryman_bank_accounts_deliveryman_id_fkey" FOREIGN KEY ("deliveryman_id") REFERENCES "deliverymen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
