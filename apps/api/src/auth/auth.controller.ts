import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CompanyDto } from './dto/company.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { isMobileDevice } from '../utils/fn';
import { DeliverymanDto } from './dto/deliverymen.dto';
import { User } from '@prisma/client';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        user: { id: 1, username: 'exampleUser' },
        token: 'exampleToken',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  login(
    @Body() loginDto: LoginDto,
    @Headers('User-agent') agent: string,
  ): Promise<{
    token: string;
    user: User;
  }> {
    return this.authService.login(loginDto, isMobileDevice(agent));
  }

  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifica se o email existe para recuperação de senha' })
  @ApiResponse({ status: 200, description: 'Email encontrado' })
  forgotPassword(@Body() body: ForgotPasswordDto): Promise<void> {
    return this.authService.ensureUserEmail(body);
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redefine a senha informando email e nova senha' })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso' })
  resetPassword(@Body() body: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(body);
  }
  @ApiOperation({ summary: 'Company signup' })
  @ApiResponse({
    status: 201,
    description: 'Company signup successful',
  })
  @ApiResponse({ status: 422, description: 'Unprocessable Entity' })
  @Post('signup/company')
  @HttpCode(HttpStatus.CREATED)
  signupCompany(@Body() company: CompanyDto): Promise<void> {
    return this.authService.signupCompany(company);
  }

  @ApiOperation({ summary: 'Deliveryman signup' })
  @ApiResponse({
    status: 201,
    description: 'Deliveryman signup successful',
  })
  @ApiResponse({ status: 422, description: 'Unprocessable Entity' })
  @Post('signup/deliveryman')
  @HttpCode(HttpStatus.CREATED)
  signupDeliveryman(@Body() deliveryman: DeliverymanDto): Promise<void> {
    return this.authService.signupDeliveryman(deliveryman);
  }
}
