import {
  IsBoolean,
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeliverySimulateDto } from './delivery-simulate.dto';

export class DeliveryCreateDto extends DeliverySimulateDto {
  @ApiProperty({
    description: 'Height of the delivery package in centimeters',
    minimum: 0,
    example: 50,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  height: number;

  @ApiProperty({
    description: 'Width of the delivery package in centimeters',
    minimum: 0,
    example: 30,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  width: number;

  @ApiProperty({
    description: 'Length of the delivery package in centimeters',
    minimum: 0,
    example: 40,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  length: number;

  @ApiProperty({
    description: 'informações adicionais',
    example: 'produtos frageis | pesados',
  })
  @IsNotEmpty()
  @IsString()
  information: string;

  @ApiProperty({
    description: 'Email do cliente',
    example: 'email@email.com',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Nome do cliente',
    example: 'João da Silva',
  })
  @IsNotEmpty()
  @IsString()
  @IsMobilePhone('pt-BR')
  telefone: string;

  @ApiProperty({
    description: 'Weight of the delivery package in kilograms',
    minimum: 0,
    example: 5.5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiProperty({
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFragile: boolean;
}

export class DeliveryCreateResponse {
  @ApiProperty({
    description: 'Código da entrega',
    example: 'BA-Y8Us',
  })
  code: string;
}
