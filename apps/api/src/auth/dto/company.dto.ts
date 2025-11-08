import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { message } from '../../utils/message';

export class CompanyDto {
  @ApiProperty({ description: 'Nome da empresa' })
  @IsString({
    message: message.isString,
  })
  @IsNotEmpty({ message: message.isNotEmpty })
  name: string;

  @ApiProperty({ description: 'Email da empresa' })
  @IsEmail({}, { message: message.isEmail })
  @IsNotEmpty({ message: message.isNotEmpty })
  email: string;

  @ApiProperty({ description: 'CNPJ da empresa (14 dígitos)' })
  @IsString({
    message: message.isString,
  })
  @IsNotEmpty({ message: message.isNotEmpty })
  @Matches(/^\d{14}$/, { message: 'CNPJ deve conter 14 dígitos' })
  cnpj: string;

  @ApiProperty({ description: 'Senha de acesso (mínimo 6 caracteres)' })
  @IsString({
    message: message.isString,
  })
  @MinLength(6, { message: message.minLength })
  password: string;

  @ApiProperty({ description: 'Telefone de contato' })
  @IsString({
    message: message.isString,
  })
  @IsNotEmpty({ message: message.isNotEmpty })
  phone: string;

  @ApiProperty({ description: 'Endereço da empresa' })
  @IsString({
    message: message.isString,
  })
  @IsNotEmpty({ message: message.isNotEmpty })
  address: string;

  @ApiProperty({ description: 'Cidade' })
  @IsString({
    message: message.isString,
  })
  @IsNotEmpty({ message: message.isNotEmpty })
  city: string;

  @ApiProperty({ description: 'Número do endereço' })
  @IsString({
    message: message.isString,
  })
  number: string;

  @ApiPropertyOptional({ description: 'Complemento do endereço' })
  @IsOptional()
  @IsString({
    message: message.isString,
  })
  complement: string;

  @ApiProperty({ description: 'Estado' })
  @IsString({
    message: message.isString,
  })
  @IsNotEmpty({ message: message.isNotEmpty })
  state: string;

  @ApiProperty({ description: 'CEP' })
  @IsString({
    message: message.isString,
  })
  @IsNotEmpty({ message: message.isNotEmpty })
  zipCode: string;
}

export class CurrencyLocationDto {
  @ApiProperty({
    description: 'Latitude no intervalo de -90 a 90, com até 8 casas decimais',
    example: 12.3456789,
  })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(-90, {
    message: message.isMin,
  })
  @Max(90, { message: message.isMax })
  latitude: number;

  @ApiProperty({
    description:
      'Longitude no intervalo de -180 a 180, com até 8 casas decimais',
    example: -45.67891234,
  })
  @IsNumber({ maxDecimalPlaces: 8 }, { message: message.isDecimalPlates })
  @Min(-180, {
    message: message.isMin,
  })
  @Max(180, { message: message.isMax })
  longitude: number;
}
