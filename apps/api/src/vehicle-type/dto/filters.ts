import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class VehicleTypeQueryparams {
  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    default: '1',
  })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: '100',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
