import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import {
  DeliverymanBankAccountType,
  PixKeyType,
} from '@prisma/client';

export class CreateDeliverymanBankAccountDto {
  @ApiPropertyOptional({
    description: 'Nome do banco (obrigatório quando não houver chave PIX)',
    example: 'Banco do Brasil',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  bankName?: string;

  @ApiPropertyOptional({ description: 'Código do banco', example: '001' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  bankCode?: string;

  @ApiPropertyOptional({
    description: 'Número da agência (obrigatório quando não houver chave PIX)',
    example: '1234',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  agency?: string;

  @ApiPropertyOptional({
    description: 'Número da conta (obrigatório quando não houver chave PIX)',
    example: '67890',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  account?: string;

  @ApiPropertyOptional({
    description: 'Tipo da conta (obrigatório quando não houver chave PIX)',
    enum: DeliverymanBankAccountType,
    example: DeliverymanBankAccountType.CHECKING,
  })
  @IsOptional()
  @IsEnum(DeliverymanBankAccountType)
  accountType?: DeliverymanBankAccountType;

  @ApiPropertyOptional({
    description: 'Nome do titular da conta (obrigatório quando não houver chave PIX)',
    example: 'João Silva',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  holderName?: string;

  @ApiPropertyOptional({
    description: 'CPF do titular (somente números) - obrigatório quando não houver chave PIX',
    example: '12345678901',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'cpf deve conter 11 dígitos' })
  cpf?: string;

  @ApiPropertyOptional({
    description: 'Tipo da chave PIX',
    enum: PixKeyType,
    example: PixKeyType.CPF,
  })
  @IsOptional()
  @IsEnum(PixKeyType)
  pixKeyType?: PixKeyType;

  @ApiPropertyOptional({
    description: 'Valor da chave PIX (obrigatório quando o tipo for informado)',
    example: '12345678901',
  })
  @ValidateIf((dto: CreateDeliverymanBankAccountDto) => !!dto.pixKeyType)
  @IsString()
  @MaxLength(140)
  pixKey?: string;

  @ApiPropertyOptional({
    description: 'Define se a conta será marcada como padrão',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
