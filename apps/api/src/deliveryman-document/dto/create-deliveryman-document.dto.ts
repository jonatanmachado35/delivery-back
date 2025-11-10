import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
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

  @ApiProperty({ description: 'Número do documento (RG / CNH)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  documentNumber: string;

  @ApiProperty({ description: 'Nome completo conforme documento' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @ApiProperty({ description: 'CPF do titular (somente números)', example: '12345678901' })
  @IsString()
  @Matches(/^\d{11}$/, { message: 'cpf deve conter 11 dígitos' })
  cpf: string;

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
}
