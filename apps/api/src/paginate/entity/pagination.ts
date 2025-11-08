import { ApiProperty } from '@nestjs/swagger';
import { IPaginateResponse } from '../../utils/fn';

export class Pagination<T> implements IPaginateResponse<T> {
  @ApiProperty({
    description: 'Lista de registros',
    required: true,
    isArray: true,
    type: Array<T>,
  })
  data: T[];

  @ApiProperty({
    type: Number,
    description: 'Total de registros',
    required: true,
  })
  total: number;

  @ApiProperty({
    type: Number,
    description: 'Página atual',
    required: true,
  })
  currentPage: number;

  @ApiProperty({
    type: Number,
    description: 'Total de páginas',
    required: true,
  })
  totalPage: number;
}
