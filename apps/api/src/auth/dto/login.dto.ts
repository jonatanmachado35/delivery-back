import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { message } from '../../utils/message';

export class LoginDto {
  @ApiProperty({ description: 'Email do usuário', example: 'user@example.com' })
  @IsEmail(
    {},
    {
      message: message.isEmail,
    },
  )
  email: string;

  @ApiProperty({ description: 'Senha de acesso (mínimo 6 caracteres)' })
  @IsString({ message: message.isString })
  @MinLength(6, { message: message.minLength })
  password: string;
}
