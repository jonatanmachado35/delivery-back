import { ApiProperty } from '@nestjs/swagger';
import {
  DeliverymanBankAccountType,
  PixKeyType,
} from '@prisma/client';

export class DeliverymanBankAccountResponseDto {
  @ApiProperty({ description: 'Identificador da conta bancária' })
  id: number;

  @ApiProperty({ description: 'Nome do banco' })
  bankName: string;

  @ApiProperty({ description: 'Código do banco', required: false })
  bankCode?: string | null;

  @ApiProperty({ description: 'Agência' })
  agency: string;

  @ApiProperty({ description: 'Dígito da agência', required: false })
  agencyDigit?: string | null;

  @ApiProperty({ description: 'Número da conta' })
  account: string;

  @ApiProperty({ description: 'Dígito da conta', required: false })
  accountDigit?: string | null;

  @ApiProperty({
    description: 'Tipo da conta',
    enum: DeliverymanBankAccountType,
  })
  accountType: DeliverymanBankAccountType;

  @ApiProperty({ description: 'Nome do titular' })
  holderName: string;

  @ApiProperty({ description: 'CPF do titular (somente números)' })
  cpf: string;

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
