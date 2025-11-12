import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliverymanDocumentType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateDeliverymanDocumentDto {
  @ApiProperty({ description: 'Tipo do documento (ex: CNH_frente, CNH_verso, Selfie)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @ApiPropertyOptional({ description: 'Número do documento (RG / CNH)' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  documentNumber?: string;

  @ApiPropertyOptional({ description: 'Nome completo conforme documento' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  fullName?: string;

  @ApiPropertyOptional({ description: 'CPF do titular (somente números)', example: '12345678901' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'cpf deve conter 11 dígitos' })
  cpf?: string;

  @ApiPropertyOptional({ description: 'Categoria / tipo da CNH (opcional)' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  cnhType?: string;

  @ApiPropertyOptional({ description: 'Descrição opcional do documento' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ description: 'Órgão emissor do documento' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  orgaoEmissao?: string;

  @ApiPropertyOptional({
    description: 'Documento escolhido pelo entregador',
    enum: DeliverymanDocumentType,
  })
  @IsOptional()
  @IsEnum(DeliverymanDocumentType)
  documentType?: DeliverymanDocumentType;
}
