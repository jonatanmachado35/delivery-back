import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SocketDto {
  @ApiProperty({
    description: 'Socket ID',
    example: '123456789',
    required: false,
  })
  @IsString()
  socketId?: string;
}
