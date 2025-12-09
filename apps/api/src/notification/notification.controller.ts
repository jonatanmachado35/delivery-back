import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { PaymentSlipRequestDto } from './dto/payment-slip-request.dto';
import { Request } from 'express';
import { User } from '@prisma/client';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('payment-slip-request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cria notificação para o administrador gerar boleto de pagamento',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notificação registrada com sucesso',
  })
  async requestPaymentSlip(
    @Body() body: PaymentSlipRequestDto,
    @Req() req: Request & { user: User },
  ): Promise<void> {
    await this.notificationService.requestPaymentSlip(body, req.user);
  }
}
