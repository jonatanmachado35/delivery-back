import {
  IsEmail,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';

export class IUserQueryParams {
  @ApiProperty({
    description: 'Filter users by status',
    required: false,
    enum: UserStatus,
  })
  @IsOptional()
  @IsString()
  @IsIn([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.INACTIVE])
  status?: UserStatus;

  @ApiProperty({
    description: 'Filter users by role',
    required: false,
    enum: Role,
  })
  @IsOptional()
  @IsString()
  @IsIn([Role.ADMIN, Role.COMPANY, Role.DELIVERY])
  role?: Role;

  @ApiProperty({ description: 'Filter users by email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    default: '1',
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: '100',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
