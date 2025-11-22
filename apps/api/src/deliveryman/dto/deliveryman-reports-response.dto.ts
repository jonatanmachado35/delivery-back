import { ApiProperty } from '@nestjs/swagger';

class DailyStatsResponseDto {
  @ApiProperty({ description: 'Nome do dia em inglês' })
  dayOfWeek: string;

  @ApiProperty({
    description: 'Entregas por faixa de 4 horas (00-04, 04-08, 08-12, 12-16, 16-20, 20-24)',
    type: [Number],
  })
  hourlyData: number[];

  @ApiProperty({ description: 'Total de entregas no dia' })
  totalDeliveries: number;

  @ApiProperty({ description: 'Entregas concluídas no dia' })
  completedDeliveries: number;

  @ApiProperty({ description: 'Entregas pendentes no dia' })
  pendingDeliveries: number;
}

class WeeklyStatsResponseDto {
  @ApiProperty({ type: DailyStatsResponseDto })
  sunday: DailyStatsResponseDto;

  @ApiProperty({ type: DailyStatsResponseDto })
  monday: DailyStatsResponseDto;

  @ApiProperty({ type: DailyStatsResponseDto })
  tuesday: DailyStatsResponseDto;

  @ApiProperty({ type: DailyStatsResponseDto })
  wednesday: DailyStatsResponseDto;

  @ApiProperty({ type: DailyStatsResponseDto })
  thursday: DailyStatsResponseDto;

  @ApiProperty({ type: DailyStatsResponseDto })
  friday: DailyStatsResponseDto;

  @ApiProperty({ type: DailyStatsResponseDto })
  saturday: DailyStatsResponseDto;
}

class ReportsSummaryDto {
  @ApiProperty({ description: 'Total de entregas na semana' })
  totalDeliveries: number;

  @ApiProperty({ description: 'Entregas concluídas na semana' })
  completedDeliveries: number;

  @ApiProperty({ description: 'Entregas pendentes na semana' })
  pendingDeliveries: number;

  @ApiProperty({ description: 'Ganhos totais na semana em reais' })
  totalEarnings: number;
}

class DeliveryReportItemDto {
  @ApiProperty({ description: 'ID da entrega' })
  id: string;

  @ApiProperty({ description: 'Código da entrega' })
  code: string;

  @ApiProperty({ description: 'Status normalizado (completed, pending, in_progress)' })
  status: string;

  @ApiProperty({ description: 'Dia da semana em inglês' })
  day: string;

  @ApiProperty({ description: 'Nome do cliente' })
  customerName: string;

  @ApiProperty({ description: 'Endereço completo da entrega' })
  address: string;

  @ApiProperty({ description: 'Valor da entrega em reais' })
  value: number;

  @ApiProperty({ description: 'Data/hora de criação (ISO)' })
  createdAt: string;

  @ApiProperty({ description: 'Descrição da entrega', required: false })
  description?: string;

  @ApiProperty({ description: 'Data da entrega', required: false })
  date?: string;
}

export class DeliverymanReportsResponseDto {
  @ApiProperty({ type: WeeklyStatsResponseDto })
  weeklyStats: WeeklyStatsResponseDto;

  @ApiProperty({ type: ReportsSummaryDto })
  summary: ReportsSummaryDto;

  @ApiProperty({ type: [DeliveryReportItemDto] })
  deliveries: DeliveryReportItemDto[];
}
