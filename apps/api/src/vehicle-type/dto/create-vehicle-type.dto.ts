import { ApiProperty } from "@nestjs/swagger"
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator"

export class CreateVehicleTypeDto {
  @ApiProperty({
    description: "nome do tipo de veiculo",
    example: "carro",
  })
  @IsString()
  @IsNotEmpty()
  type: string

  @ApiProperty({
    description: "tarifa base do veículo",
    minimum: 0,
    maximum: 999.99,
    example: 100.0,
    required: true,
    type: Number,
  })
  @IsNumber({ allowInfinity: false })
  @Max(999.99)
  @Min(0)
  @IsNotEmpty()
  tarifaBase: number

  @ApiProperty({
    description: "valor por KM adicional",
    minimum: 0,
    maximum: 999.99,
    example: 10.5,
    required: true,
    type: Number,
  })
  @IsNumber({ allowInfinity: false })
  @Max(999.99)
  @Min(0)
  @IsNotEmpty()
  valorKMAdicional: number

  @ApiProperty({
    description: "valor por parada adicional",
    minimum: 0,
    maximum: 999.99,
    example: 25.0,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber({ allowInfinity: false })
  @Max(999.99)
  @Min(0)
  @IsNotEmpty()
  paradaAdicional?: number

  @ApiProperty({
    description: "valor por ajudante adicional",
    example: 50.0,
    minimum: 0,
    maximum: 999.99,
    required: false,
    type: Number,
  })
  @IsNumber({ allowInfinity: false })
  @IsOptional()
  @IsNotEmpty()
  @Max(999.99)
  @Min(0)
  ajudanteAdicional?: number
}
