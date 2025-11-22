import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class DeliveryStatusUpdateDto {
  @ApiProperty({
    description:
      "Novo status da entrega. Aceita 'pending', 'in_transit', 'in_progress', 'delivered', 'completed', 'cancelled', 'canceled'",
  })
  @IsIn([
    'pending',
    'in_transit',
    'in_progress',
    'delivered',
    'completed',
    'cancelled',
    'canceled',
  ])
  status: string;

  @ApiPropertyOptional({ description: 'Latitude do entregador no momento' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude do entregador no momento' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Observações da atualização' })
  @IsOptional()
  notes?: string;
}

export class DeliveryStatusUpdateResponseDto {
  @ApiProperty({ description: 'Identificador da entrega' })
  id: number;

  @ApiProperty({ description: 'Código da entrega' })
  code: string;

  @ApiProperty({
    description: 'Status retornado no formato esperado pelo app',
    example: 'delivered',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Data/hora de conclusão, quando aplicável',
  })
  deliveredAt?: string;
}
