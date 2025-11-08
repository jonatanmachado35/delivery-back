import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ description: 'Unique identifier for the user' })
  id: string;

  @ApiProperty({ description: 'Name of the user' })
  name: string;

  @ApiProperty({ description: 'Email address of the user' })
  email: string;

  @ApiProperty({ description: 'Hashed password of the user' })
  password?: string;

  @ApiProperty({ description: 'Date when the user was created' })
  createdAt?: Date;

  @ApiProperty({ description: 'Date when the user was last updated' })
  updatedAt?: Date;
}
