import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { message } from '../../utils/message';

export class DeliverymanDto {
  @ApiProperty({ description: 'Nome da entregador' })
  @IsString({
    message: message.isString,
  })
  @IsNotEmpty({ message: message.isNotEmpty })
  name: string;

  @ApiProperty({ description: 'Email da entregador' })
  @IsEmail({}, { message: message.isEmail })
  @IsNotEmpty({ message: message.isNotEmpty })
  email: string;

  @ApiProperty({ description: 'data de nascimento', type: Date })
  @IsDateString({ strict: true })
  dob: string;

  @ApiProperty({ description: 'cpf da entregador (11 dígitos)' })
  @IsString({
    message: message.isString,
  })
  @IsNotEmpty({ message: message.isNotEmpty })
  @IsNumberString()
  @Matches(/^\d{11}$/, { message: 'cpf deve conter 11 dígitos' })
  cpf: string;

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

  @ApiProperty({ description: 'Endereço da entregador' })
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

  //vehicle

  @ApiProperty({ description: 'Placa do veículo' })
  @IsString({
    message: message.isString,
  })
  @IsNotEmpty({ message: message.isNotEmpty })
  licensePlate: string;

  @ApiProperty({ description: 'Marca do veículo' })
  @IsString({
    message: message.isString,
  })
  @IsNotEmpty({ message: message.isNotEmpty })
  brand: string;

  @ApiProperty({ description: 'Modelo do veículo' })
  @IsString({
    message: message.isString,
  })
  @IsNotEmpty({ message: message.isNotEmpty })
  model: string;

  @ApiProperty({ description: 'Ano de fabricação do veículo' })
  @IsString({
    message: message.isString,
  })
  @IsNotEmpty({ message: message.isNotEmpty })
  @Matches(/^\d{4}$/, { message: 'Ano deve conter 4 dígitos' })
  year: string;

  @ApiProperty({ description: 'Cor do veículo' })
  @IsString({
    message: message.isString,
  })
  @IsNotEmpty({ message: message.isNotEmpty })
  color: string;

  @ApiProperty({ description: 'Tipo do veículo' })
  @IsNotEmpty({ message: message.isNotEmpty })
  vehicleType: string;
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
