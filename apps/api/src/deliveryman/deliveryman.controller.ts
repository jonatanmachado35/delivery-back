import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@prisma/client';
import { DeliverymanService } from './deliveryman.service';
import { DeliverymanStatsResponseDto } from './dto/deliveryman-stats-response.dto';

@Controller('deliveryman')
@ApiTags('Deliveryman')
export class DeliverymanController {
  constructor(private deliverymanService: DeliverymanService) {}

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
}
