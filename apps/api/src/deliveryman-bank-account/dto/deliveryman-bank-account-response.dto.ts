import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DeliverymanBankAccountType,
  PixKeyType,
} from '@prisma/client';

export class DeliverymanBankAccountResponseDto {
  @ApiProperty({ description: 'Identificador da conta bancária' })
  id: number;

  @ApiPropertyOptional({ description: 'Nome do banco' })
  bankName?: string | null;

  @ApiProperty({ description: 'Código do banco', required: false })
  bankCode?: string | null;

  @ApiPropertyOptional({ description: 'Agência' })
  agency?: string | null;

  @ApiPropertyOptional({ description: 'Número da conta' })
  account?: string | null;

  @ApiPropertyOptional({
    description: 'Tipo da conta',
    enum: DeliverymanBankAccountType,
  })
  accountType?: DeliverymanBankAccountType | null;

  @ApiPropertyOptional({ description: 'Nome do titular' })
  holderName?: string | null;

  @ApiPropertyOptional({ description: 'CPF do titular (somente números)' })
  cpf?: string | null;

  @ApiProperty({ description: 'Tipo da chave PIX', enum: PixKeyType, required: false })
  pixKeyType?: PixKeyType | null;

  @ApiProperty({ description: 'Valor da chave PIX', required: false })
  pixKey?: string | null;

  @ApiProperty({ description: 'Indica se essa conta é a padrão' })
  isDefault: boolean;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  updatedAt: Date;
}
