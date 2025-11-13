import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email cadastrado do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

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
