import { ApiProperty } from '@nestjs/swagger';
import { BillingStatus } from '@prisma/client';
import { IsIn, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class BillingCreateDto {
  @ApiProperty({
    required: true,
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    required: false,
    type: 'number',
    description: 'Obrigatório apenas para administradores',
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  idUser?: number;

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
