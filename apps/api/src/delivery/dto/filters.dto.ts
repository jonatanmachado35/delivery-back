import { ApiProperty } from "@nestjs/swagger"
import { DeliveryStatus, User } from "@prisma/client"
import { Type } from "class-transformer"
import {
  IsInt,
  IsBooleanString,
  IsDateString,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
} from "class-validator"

export class DeliveryQueryParams {
  @ApiProperty({
    type: String,
    description: "Tipo de veiculo",
    required: false,
  })
  @IsOptional()
  @IsString()
  vehicleType?: string

  @ApiProperty({
    type: Boolean,
    description: "é Fragil?",
    required: false,
  })
  @IsOptional()
  @IsBooleanString()
  isFragile?: string

  @ApiProperty({
    type: String,
    description: "Data de conclusão - início",
    required: false,
    example: "2024-01-01",
  })
  @IsOptional()
  @IsDateString()
  completedFrom?: string

  @ApiProperty({
    type: String,
    description: "Data de conclusão - fim",
    required: false,
    example: "2024-12-31",
  })
  @IsOptional()
  @IsDateString()
  completedTo?: string

  @ApiProperty({
    type: String,
    description: "Preço máximo",
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  maxPrice?: string

  @ApiProperty({
    type: String,
    description: "Preço mínimo",
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  minPrice?: string

  @ApiProperty({
    type: String,
    description: "Código completo ou parcial",
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string

  @ApiProperty({
    type: String,
    description: "Cidade de origem",
    required: false,
  })
  @IsOptional()
  @IsString()
  originCity?: string

  @ApiProperty({
    type: String,
    description: "Cidade do cliente",
    required: false,
  })
  @IsOptional()
  @IsString()
  clientCity?: string

  @ApiProperty({
    description: "Status da entrega",
    required: false,
    enum: DeliveryStatus,
  })
  @IsOptional()
  @IsIn(Object.values(DeliveryStatus))
  status?: DeliveryStatus

  @ApiProperty({
    description: "Número da página",
    required: false,
    default: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @ApiProperty({
    description: "Itens por página",
    required: false,
    default: 100,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number

  user: User
}
