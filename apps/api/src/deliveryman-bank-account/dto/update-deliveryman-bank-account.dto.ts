import { PartialType } from '@nestjs/swagger';
import { CreateDeliverymanBankAccountDto } from './create-deliveryman-bank-account.dto';

export class UpdateDeliverymanBankAccountDto extends PartialType(
  CreateDeliverymanBankAccountDto,
) {}
