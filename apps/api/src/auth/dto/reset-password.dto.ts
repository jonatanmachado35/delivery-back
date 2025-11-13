import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email utilizado para solicitar a redefinição',
    example: 'usuario@exemplo.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Token recebido ao solicitar a redefinição de senha',
    example: '3fdd8a6c04554b89bcd543b0f2e09c50',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Nova senha',
    example: 'NovaSenha@123',
  })
  @IsString()
  @MinLength(6)
  @Matches(/[A-Za-z]/, { message: 'senha deve conter letras' })
  @Matches(/\d/, { message: 'senha deve conter números' })
  newPassword: string;
}
