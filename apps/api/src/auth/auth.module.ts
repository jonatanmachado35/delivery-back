import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { LocationService } from '../location/location.service';
import { jwtModuleConfig } from '../config/jwt.config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      useFactory: jwtModuleConfig,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocationService],
})
export class AuthModule {}
