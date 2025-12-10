import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class DeliverymanTransactionDto {
  @ApiProperty({ description: 'Identificador da transação' })
  id: number;

  @ApiProperty({ description: 'Tipo: earning ou withdrawal' })
  type: string;

  @ApiProperty({ description: 'Valor da transação' })
  amount: number;

  @ApiPropertyOptional({ description: 'Descrição da transação' })
  description?: string;

  @ApiProperty({ description: 'Status da transação (ex.: completed)' })
  status: string;

  @ApiPropertyOptional({ description: 'Chave PIX utilizada (quando houver)' })
  pixKey?: string;

  @ApiProperty({ description: 'Data/hora de criação (ISO)' })
  createdAt: string;
}

export class DeliverymanBalanceResponseDto {
  @ApiProperty({ description: 'Saldo atual disponível' })
  currentBalance: number;

  @ApiProperty({ description: 'Total ganho em entregas concluídas' })
  totalEarned: number;

  @ApiProperty({ description: 'Total sacado/retirado' })
  totalWithdrawn: number;

  @ApiProperty({ description: 'Saldo pendente em análise/liberação' })
  pendingBalance: number;

  @ApiProperty({ type: [DeliverymanTransactionDto] })
  transactions: DeliverymanTransactionDto[];
}
