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
import { DeliveryService } from './delivery.service';
import {
  DeliveryCreateDto,
  DeliveryCreateResponse,
} from './dto/delivery-create.dto';
import { DeliverySimulateDto } from './dto/delivery-simulate.dto';
import { Request } from 'express';
import { User } from '@prisma/client';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { DeliverySimulationResponseDto } from './dto/delivery-simulation-response.dto';
import { DeliveryQueryParams } from './dto/filters.dto';
import { DeliveryPaginateResponse } from './dto/delivery-paginate-response.dto';
import {
  DeliveryStatusUpdateDto,
  DeliveryStatusUpdateResponseDto,
} from './dto/delivery-status-update.dto';

@Controller('delivery')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'paginacao das entregas' })
  @ApiOkResponse({
    description: 'Paginação de entregas',
    type: DeliveryPaginateResponse,
  })
  paginate(
    @Query() filter: DeliveryQueryParams,
    @Req() req: Request & { user: User },
  ): Promise<DeliveryPaginateResponse> {
    filter.user = req.user;
    const page = Math.max(filter.page ?? 1, 1);
    const limit = Math.max(filter.limit ?? 100, 1);

    return this.deliveryService.paginate(filter, page, limit);
  }

  @Post('simulate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Simula entrega' })
  @ApiOkResponse({
    description: 'Realiza simulação',
    type: DeliverySimulationResponseDto,
  })
  simulateDelivery(
    @Body() body: DeliverySimulateDto,
    @Req() req: Request & { user: User },
  ): Promise<DeliverySimulationResponseDto> {
    const user = req.user;

    return this.deliveryService.simulateDelivery(body, user.id);
  }

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'cria entregas' })
  @ApiCreatedResponse({
    type: DeliveryCreateResponse,
  })
  @ApiOkResponse({
    description: 'entrega criada com sucesso',
    type: DeliveryCreateResponse,
  })
  createDelivery(
    @Body() body: DeliveryCreateDto,
    @Req() req: Request & { user: User },
  ): Promise<DeliveryCreateResponse> {
    const user = req.user;

    return this.deliveryService.createDelivery(body, user.id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualiza status de uma entrega' })
  @ApiOkResponse({
    description: 'Status atualizado',
    type: DeliveryStatusUpdateResponseDto,
  })
  updateStatus(
    @Param('id') id: string,
    @Body() body: DeliveryStatusUpdateDto,
    @Req() req: Request & { user: Pick<User, 'id' | 'role'> },
  ): Promise<DeliveryStatusUpdateResponseDto> {
    return this.deliveryService.updateStatus(Number(id), req.user, body);
  }
}
