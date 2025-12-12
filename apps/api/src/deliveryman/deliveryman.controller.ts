import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@prisma/client';
import { DeliverymanService } from './deliveryman.service';
import { DeliverymanStatsResponseDto } from './dto/deliveryman-stats-response.dto';
import { DeliverymanReportsResponseDto } from './dto/deliveryman-reports-response.dto';
import { DeliverymanBalanceResponseDto } from './dto/deliveryman-balance-response.dto';
import { WithdrawRequestDto, WithdrawResponseDto } from './dto/withdraw.dto';

@Controller('deliveryman')
@ApiTags('Deliveryman')
export class DeliverymanController {
  constructor(private deliverymanService: DeliverymanService) { }

  @Get(':id/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna estatísticas do entregador' })
  @ApiResponse({ status: HttpStatus.OK, type: DeliverymanStatsResponseDto })
  getStats(
    @Param('id') id: string,
    @Req() req: Request & { user: Pick<User, 'id' | 'role'> },
  ): Promise<DeliverymanStatsResponseDto> {
    return this.deliverymanService.getStats(Number(id), req.user);
  }

  @Get(':id/reports')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna relatórios semanais do entregador' })
  @ApiResponse({ status: HttpStatus.OK, type: DeliverymanReportsResponseDto })
  getReports(
    @Param('id') id: string,
    @Req() req: Request & { user: Pick<User, 'id' | 'role'> },
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<DeliverymanReportsResponseDto> {
    return this.deliverymanService.getReports(
      Number(id),
      req.user,
      startDate,
      endDate,
    );
  }

  @Get(':id/balance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retorna saldo e transações do entregador' })
  @ApiResponse({ status: HttpStatus.OK, type: DeliverymanBalanceResponseDto })
  getBalance(
    @Param('id') id: string,
    @Req() req: Request & { user: Pick<User, 'id' | 'role'> },
  ): Promise<DeliverymanBalanceResponseDto> {
    return this.deliverymanService.getBalance(Number(id), req.user);
  }

  @Post(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realiza saque do saldo do entregador' })
  @ApiResponse({ status: HttpStatus.OK, type: WithdrawResponseDto })
  withdraw(
    @Param('id') id: string,
    @Body() body: WithdrawRequestDto,
    @Req() req: Request & { user: Pick<User, 'id' | 'role'> },
  ): Promise<WithdrawResponseDto> {
    return this.deliverymanService.withdraw(Number(id), req.user, body);
  }
}
