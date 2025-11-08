import { ApiProperty } from '@nestjs/swagger';
import { BillingStatus, BillingType } from '@prisma/client';

export class BillingPaginateResponse {
  @ApiProperty({
    description: 'ID do faturamento',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Valor do faturamento',
    example: 100.45,
    type: Number,
  })
  amount: number;

  @ApiProperty({
    description: 'Tipo do faturamento',
    example: BillingType.EXPENSE,
    enum: BillingType,
  })
  type: BillingType;

  @ApiProperty({
    description: 'Status do faturamento',
    example: BillingStatus.PENDING,
    enum: BillingStatus,
  })
  status: BillingStatus;

  @ApiProperty({
    description: 'Descrição do faturamento',
    example: 'Faturamento de janeiro',
    type: String,
  })
  description: string;
}
