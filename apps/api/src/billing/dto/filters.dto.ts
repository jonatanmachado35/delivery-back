import { ApiProperty } from '@nestjs/swagger';
import { BillingStatus, BillingType, User } from '@prisma/client';
import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class BillingQueryParams {
  @ApiProperty({
    description: 'tipo de faturamento',
    required: false,
    enum: BillingType,
  })
  @IsOptional()
  @IsIn(Object.values(BillingType))
  type: BillingType;

  @ApiProperty({
    description: 'Status do faturamento',
    required: false,
    enum: BillingStatus,
  })
  @IsOptional()
  @IsIn(Object.values(BillingStatus))
  status: BillingStatus;

  @ApiProperty({
    description: 'Descrição do faturamento',
    required: false,
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    default: '1',
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: '100',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  user?: User;
}
