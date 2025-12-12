import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { message } from '../../utils/message';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token gerado no login',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: message.isString })
  @IsNotEmpty({ message: message.isNotEmpty })
  refreshToken: string;
}
