import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PaymentSlipRequestDto {
  @ApiProperty({
    description:
      'Mensagem opcional que será enviada ao administrador junto com a solicitação do boleto.',
    example: 'Poderia gerar o boleto do faturamento referente a julho?',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @ApiProperty({
    description:
      'Chave da fatura relacionada ao pedido de boleto (opcional, usada para referência).',
    example: '01J0Y5D0K7ZK8N3HS5DJ3GF0S8',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  billingKey?: string;
}
