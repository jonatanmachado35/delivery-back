import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@prisma/client';
import { NotificationService } from './notification.service';
import { NotificationCreateDto } from './dto/notification-create.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import {
  NotificationDto,
  NotificationPaginateResponse,
  UnreadCountResponseDto,
} from './dto/notification-response.dto';
import { PaymentSlipRequestDto } from './dto/payment-slip-request.dto';

@ApiTags('Notifications')
@ApiBearerAuth('Authorization')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lista notificações do usuário autenticado' })
  @ApiOkResponse({
    description: 'Paginação de notificações',
    type: NotificationPaginateResponse,
  })
  list(
    @Req() req: Request & { user: User },
    @Query() query: NotificationQueryDto,
  ): Promise<NotificationPaginateResponse> {
    return this.notificationService.list(req.user, query);
  }

  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna o total de notificações não lidas' })
  @ApiOkResponse({
    description: 'Total de notificações não lidas',
    type: UnreadCountResponseDto,
  })
  unreadCount(
    @Req() req: Request & { user: User },
  ): Promise<UnreadCountResponseDto> {
    return this.notificationService.unreadCount(req.user);
  }

  @Post('payment-slip-request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cria notificação para o administrador gerar boleto de pagamento',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notificação registrada com sucesso',
  })
  requestPaymentSlip(
    @Body() body: PaymentSlipRequestDto,
    @Req() req: Request & { user: User },
  ): Promise<void> {
    return this.notificationService.requestPaymentSlip(body, req.user);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marca notificação como lida' })
  @ApiOkResponse({
    description: 'Notificação atualizada',
    type: NotificationDto,
  })
  markAsRead(
    @Param('id') id: string,
    @Req() req: Request & { user: User },
  ): Promise<NotificationDto> {
    return this.notificationService.markAsRead(Number(id), req.user);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprova uma notificação que exige ação' })
  @ApiOkResponse({
    description: 'Notificação aprovada',
    type: NotificationDto,
  })
  approve(
    @Param('id') id: string,
    @Req() req: Request & { user: User },
  ): Promise<NotificationDto> {
    return this.notificationService.approve(Number(id), req.user);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rejeita uma notificação que exige ação' })
  @ApiOkResponse({
    description: 'Notificação rejeitada',
    type: NotificationDto,
  })
  reject(
    @Param('id') id: string,
    @Req() req: Request & { user: User },
  ): Promise<NotificationDto> {
    return this.notificationService.reject(Number(id), req.user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria uma nova notificação' })
  @ApiCreatedResponse({
    description: 'Notificação criada',
    type: NotificationDto,
  })
  create(
    @Body() body: NotificationCreateDto,
    @Req() req: Request & { user: User },
  ): Promise<NotificationDto> {
    return this.notificationService.create(body, req.user);
  }
}
