import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class DeliverymanDeliveriesStatsDto {
  @ApiProperty({ description: 'Entregas pendentes/aguardando coleta' })
  pending: number;

  @ApiProperty({ description: 'Entregas concluídas hoje' })
  completed: number;

  @ApiPropertyOptional({ description: 'Total de entregas' })
  total?: number;
}

class DeliverymanEarningsStatsDto {
  @ApiProperty({ description: 'Ganhos do dia em reais' })
  today: number;

  @ApiPropertyOptional({ description: 'Ganhos da semana' })
  week?: number;

  @ApiPropertyOptional({ description: 'Ganhos do mês' })
  month?: number;

  @ApiPropertyOptional({ description: 'Meta de ganhos' })
  goal?: number;
}

class DeliverymanPerformanceStatsDto {
  @ApiProperty({ description: 'Tempo médio de entrega em minutos' })
  averageDeliveryTime: number;

  @ApiPropertyOptional({ description: 'Avaliação média' })
  rating?: number;
}

class DeliverymanBalanceStatsDto {
  @ApiProperty({ description: 'Saldo disponível para saque' })
  available: number;

  @ApiPropertyOptional({ description: 'Saldo pendente' })
  pending?: number;
}

export class DeliverymanStatsResponseDto {
  @ApiProperty({ type: DeliverymanDeliveriesStatsDto })
  deliveries: DeliverymanDeliveriesStatsDto;

  @ApiProperty({ type: DeliverymanEarningsStatsDto })
  earnings: DeliverymanEarningsStatsDto;

  @ApiProperty({ type: DeliverymanPerformanceStatsDto })
  performance: DeliverymanPerformanceStatsDto;

  @ApiProperty({ type: DeliverymanBalanceStatsDto })
  balance: DeliverymanBalanceStatsDto;
}
