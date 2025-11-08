import { Module } from '@nestjs/common';
import { GpsController } from './gps.controller';
import { GpsService } from './gps.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GpsGateway } from './gps.gateway';
import { JwtModule } from '@nestjs/jwt';
import { jwtModuleConfig } from '../config/jwt.config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      useFactory: jwtModuleConfig,
    }),
  ],
  controllers: [GpsController],
  providers: [GpsService, GpsGateway],
})
export class GpsModule {}
