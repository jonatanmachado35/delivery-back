import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email cadastrado do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
