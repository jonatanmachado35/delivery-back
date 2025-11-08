import { IsNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { message } from '../../utils/message';

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
