import { ApiProperty } from '@nestjs/swagger';

export class UserAvatarResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  path: string;
}
