import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class DeliverymanMonthlyStatsDto {
  @ApiProperty({ description: 'Mês no formato YYYY-MM' })
  month: string;

  @ApiProperty({ description: 'Total de entregas no mês' })
  deliveries: number;

  @ApiProperty({ description: 'Ganhos no mês em reais' })
  earnings: number;
}

export class DeliverymanStatsResponseDto {
  @ApiProperty({ description: 'Total de entregas' })
  totalDeliveries: number;

  @ApiProperty({ description: 'Entregas concluídas' })
  completedDeliveries: number;

  @ApiProperty({ description: 'Entregas pendentes' })
  pendingDeliveries: number;

  @ApiProperty({ description: 'Entregas canceladas' })
  cancelledDeliveries: number;

  @ApiProperty({ description: 'Ganhos totais em reais' })
  totalEarnings: number;

  @ApiProperty({ description: 'Avaliação média' })
  averageRating: number;

  @ApiPropertyOptional({ type: [DeliverymanMonthlyStatsDto] })
  monthlyStats?: DeliverymanMonthlyStatsDto[];
}
