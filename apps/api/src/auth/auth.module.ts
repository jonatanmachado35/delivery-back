import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { LocationService } from '../location/location.service';
import { CacheService } from '../cache/cache.service';
import { jwtModuleConfig } from '../config/jwt.config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      useFactory: jwtModuleConfig,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, CacheService, LocationService],
})
export class AuthModule {}
