import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { CurrencyLocationDto } from './dto/currency-location.dto';
import { GpsService } from './gps.service';
import { SocketDto } from '../websocket/dto/socket.dto';

@Controller('gps')
export class GpsController {
  constructor(private gpsService: GpsService) {}

  @Get('delivery/:code')
  @HttpCode(HttpStatus.OK)
  async getLocation(
    @Param('code') code: string,
    @Query() socket: SocketDto,
  ): Promise<any> {
    return this.gpsService.getLocation(code, socket);
  }

  @Patch('delivery/:code')
  @HttpCode(HttpStatus.NO_CONTENT)
  createLocation(
    @Body() body: CurrencyLocationDto,
    @Param('code') code: string,
  ): Promise<void> {
    return this.gpsService.createLocation(code, body);
  }
}
