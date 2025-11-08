import { ApiProperty } from '@nestjs/swagger';
import { BillingStatus } from '@prisma/client';
import { IsIn } from 'class-validator';

export class BillingUpdateDto {
  @ApiProperty({
    enum: BillingStatus,
    required: false,
  })
  @IsIn(Object.values(BillingStatus))
  status?: BillingStatus;

  @ApiProperty({
    type: String,
    required: false,
  })
  description?: string;
}
