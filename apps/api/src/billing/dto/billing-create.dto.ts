import { ApiProperty } from '@nestjs/swagger';
import { BillingStatus } from '@prisma/client';
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

export class BillingCreateDto {
  @ApiProperty({
    required: true,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  idUser: number;

  @ApiProperty({
    enum: BillingStatus,
    required: false,
  })
  @IsIn([BillingStatus.PENDING, BillingStatus.PAID, BillingStatus.CANCELED])
  status?: BillingStatus;

  @ApiProperty({
    type: String,
    required: false,
  })
  description?: string;
}
