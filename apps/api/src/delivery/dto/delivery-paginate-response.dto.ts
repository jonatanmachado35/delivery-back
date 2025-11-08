import { ApiProperty } from '@nestjs/swagger';
import { DeliveryStatus } from '@prisma/client';
import { Pagination } from '../../paginate/entity/pagination';

export class AddressResponseDto {
  @ApiProperty({
    description: 'Rua do endereço',
    example: 'Rua Exemplo',
  })
  street: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
  })
  number: string;

  @ApiProperty({
    description: 'Cidade',
    example: 'São Paulo',
  })
  city: string;

  @ApiProperty({
    description: 'Estado',
    example: 'SP',
  })
  state: string;

  @ApiProperty({
    description: 'CEP',
    example: '12345-678',
  })
  zipCode: string;

  @ApiProperty({
    description: 'Complemento',
    nullable: true,
    example: 'Apto 101',
  })
  complement?: string;

  @ApiProperty({
    description: 'País',
    example: 'Brasil',
  })
  country: string;
}

export class DeliveryPaginate {
  @ApiProperty({
    description: 'Código único da entrega',
    example: 'JT-VJ2k',
  })
  code: string;

  @ApiProperty({
    description: 'Altura do pacote em cm',
    nullable: true,
    example: 15.5,
  })
  height?: number;

  @ApiProperty({
    description: 'Largura do pacote em cm',
    nullable: true,
    example: 20.0,
  })
  width?: number;

  @ApiProperty({
    description: 'Comprimento do pacote em cm',
    nullable: true,
    example: 30.0,
  })
  length?: number;

  @ApiProperty({
    description: 'Peso do pacote em kg',
    nullable: true,
    example: 2.5,
  })
  weight?: number;

  @ApiProperty({
    description: 'Informações adicionais sobre a entrega',
    example: 'Entregar no portão principal',
  })
  information: string;

  @ApiProperty({
    description: 'Indica se o item é frágil',
    example: false,
  })
  isFragile: boolean;

  @ApiProperty({
    description: 'Preço da entrega em reais',
    example: '92.45',
  })
  price: string;

  @ApiProperty({
    description: 'Email do destinatário',
    example: 'cliente@exemplo.com',
  })
  email: string;

  @ApiProperty({
    description: 'Telefone do destinatário',
    example: '(16) 98853-2885',
  })
  telefone: string;

  @ApiProperty({
    description: 'Status atual da entrega',
    enum: DeliveryStatus,
    example: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @ApiProperty({
    description: 'Data e hora de conclusão da entrega',
    nullable: true,
    example: '2024-01-15T14:30:00Z',
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Tipo de veículo utilizado na entrega',
    example: 'Carro',
  })
  vehicleType: string;

  @ApiProperty({
    description: 'Endereço do cliente',
    type: AddressResponseDto,
  })
  ClientAddress: AddressResponseDto;

  @ApiProperty({
    description: 'Endereço de origem',
    type: AddressResponseDto,
  })
  OriginAddress: AddressResponseDto;

  @ApiProperty({
    description: 'Informações da empresa',
    type: Object,
    example: { name: 'Empresa Exemplo' },
  })
  Company: {
    name: string;
  };
}

export class DeliveryPaginateResponse extends Pagination<DeliveryPaginate> {
  @ApiProperty({
    description: 'Lista de entregas',
    type: Array<DeliveryPaginate>,
  })
  data: DeliveryPaginate[];
}
