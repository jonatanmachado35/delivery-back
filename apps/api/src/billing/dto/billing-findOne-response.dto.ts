import { ApiProperty } from '@nestjs/swagger';
import {
  BillingStatus,
  BillingType,
  DeliveryStatus,
  Prisma,
} from '@prisma/client';

class FileResponse {
  @ApiProperty({
    description: 'ID do arquivo',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Nome do arquivo',
    example: 'arquivo.pdf',
    type: String,
  })
  filename: string;

  @ApiProperty({
    description: 'Tamanho do arquivo',
    example: 1000000,
    type: Number,
  })
  size: number;

  @ApiProperty({
    description: 'url para acessar arquivo',
    example: 'www.arquivo.com',
    type: String,
  })
  path: string;

  @ApiProperty({
    description: 'Tipo do arquivo',
    example: 'pdf',
    type: String,
  })
  mimetype: string;

  @ApiProperty({
    description: 'Chave publica do arquivo',
    example: 'wfniowefhionwofinqwoifn',
    type: String,
  })
  publicId: string;
}

class Delivery {
  @ApiProperty({
    description: 'Status da entrega',
    example: DeliveryStatus.PENDING,
    enum: DeliveryStatus,
  })
  status: DeliveryStatus;

  @ApiProperty({
    description: 'Data de entrega',
    example: new Date(),
    type: String,
    format: 'date-time',
  })
  completedAt: string;

  @ApiProperty({
    description: 'codigo da entrega',
    example: 1,
    type: String,
  })
  code: string;
}

class ItemResponse {
  @ApiProperty({
    description: 'ID do item',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Valor do item',
    example: 100.45,
    type: Number,
  })
  price: number;

  @ApiProperty({
    type: () => Delivery,
  })
  Delivery: Delivery;
}

export class BillingFindOneResponse {
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
  amount: Prisma.Decimal;

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

  @ApiProperty({
    description: 'id do usuario vinculado',
    example: '1',
    type: Number,
  })
  userId: number;

  @ApiProperty({
    type: () => FileResponse,
  })
  File: FileResponse;

  @ApiProperty({
    type: () => [ItemResponse],
  })
  Items: ItemResponse[];
}
