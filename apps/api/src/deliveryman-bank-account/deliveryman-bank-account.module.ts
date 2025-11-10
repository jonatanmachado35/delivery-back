import { Module } from '@nestjs/common';
import { DeliverymanBankAccountController } from './deliveryman-bank-account.controller';
import { DeliverymanBankAccountService } from './deliveryman-bank-account.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeliverymanBankAccountController],
  providers: [DeliverymanBankAccountService],
})
export class DeliverymanBankAccountModule {}
