import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({
    description: 'cidade do endereço de entrega',
    example: 'São Paulo',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'estado do endereço de entrega',
    example: 'SP',
  })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({
    description: 'rua do endereço',
    example: 'Rua Exemplo',
  })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({
    description: 'número do endereço de entrega',
    example: '123',
  })
  @IsNotEmpty()
  @IsString()
  number: string;

  @ApiProperty({
    description: 'CEP do endereço de entrega',
    example: '12345-678',
  })
  @IsNotEmpty()
  @IsString()
  zipCode: string;
}

export class DeliverySimulateDto {
  @ApiProperty({
    required: true,
    description: 'endereço para onde sera entregue',
    type: AddressDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  clientAddress: AddressDto;

  @ApiProperty({
    required: false,
    description: 'endereço de onde a entrega sera buscada',
    type: AddressDto,
  })
  @ValidateIf((o: { useAddressCompany: boolean }) => !o.useAddressCompany)
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'se true, utilizar endereço da empresa',
    required: false,
    default: false,
  })
  useAddressCompany?: boolean;

  @ApiProperty({
    description: 'tipo de veiculo',
    minimum: 0,
    required: true,
    example: 99.9,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  vehicleType: string;
}
