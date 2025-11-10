import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DeliverymanBankAccountService } from './deliveryman-bank-account.service';
import { CreateDeliverymanBankAccountDto } from './dto/create-deliveryman-bank-account.dto';
import { UpdateDeliverymanBankAccountDto } from './dto/update-deliveryman-bank-account.dto';
import { Request } from 'express';
import { DeliverymanBankAccountResponseDto } from './dto/deliveryman-bank-account-response.dto';
import { User } from '@prisma/client';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../admin/admin.guard';

@Controller('deliveryman/bank-accounts')
@ApiTags('Deliveryman Bank Accounts')
export class DeliverymanBankAccountController {
  constructor(
    private deliverymanBankAccountService: DeliverymanBankAccountService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria uma nova conta bancária para o entregador logado' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: DeliverymanBankAccountResponseDto,
  })
  create(
    @Body() dto: CreateDeliverymanBankAccountDto,
    @Req() req: Request & { user: User },
  ): Promise<DeliverymanBankAccountResponseDto> {
    return this.deliverymanBankAccountService.create(req.user, dto);
  }

  @Get('my')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lista contas bancárias do entregador logado' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [DeliverymanBankAccountResponseDto],
  })
  listMine(
    @Req() req: Request & { user: User },
  ): Promise<DeliverymanBankAccountResponseDto[]> {
    return this.deliverymanBankAccountService.listMine(req.user);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualiza uma conta bancária do entregador logado' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeliverymanBankAccountResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDeliverymanBankAccountDto,
    @Req() req: Request & { user: User },
  ): Promise<DeliverymanBankAccountResponseDto> {
    return this.deliverymanBankAccountService.update(
      req.user,
      Number(id),
      dto,
    );
  }

  @Get('admin/:deliverymanId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Lista contas bancárias de um entregador (admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [DeliverymanBankAccountResponseDto],
  })
  listByDeliveryman(
    @Param('deliverymanId') deliverymanId: string,
  ): Promise<DeliverymanBankAccountResponseDto[]> {
    return this.deliverymanBankAccountService.listByDeliveryman(
      Number(deliverymanId),
    );
  }
}
