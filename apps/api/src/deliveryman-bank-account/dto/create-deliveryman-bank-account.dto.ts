import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
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
  @ApiProperty({ description: 'Nome do banco', example: 'Banco do Brasil' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  bankName: string;

  @ApiPropertyOptional({ description: 'Código do banco', example: '001' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  bankCode?: string;

  @ApiProperty({ description: 'Número da agência', example: '1234' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  agency: string;

  @ApiPropertyOptional({ description: 'Dígito da agência', example: '5' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  agencyDigit?: string;

  @ApiProperty({ description: 'Número da conta', example: '67890' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  account: string;

  @ApiPropertyOptional({ description: 'Dígito da conta', example: '1' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  accountDigit?: string;

  @ApiProperty({
    description: 'Tipo da conta',
    enum: DeliverymanBankAccountType,
    example: DeliverymanBankAccountType.CHECKING,
  })
  @IsEnum(DeliverymanBankAccountType)
  accountType: DeliverymanBankAccountType;

  @ApiProperty({ description: 'Nome do titular da conta', example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  holderName: string;

  @ApiProperty({
    description: 'CPF do titular (somente números)',
    example: '12345678901',
  })
  @IsString()
  @Matches(/^\d{11}$/, { message: 'cpf deve conter 11 dígitos' })
  cpf: string;

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
