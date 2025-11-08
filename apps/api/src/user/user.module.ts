import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LocationService } from '../location/location.service';
import { CacheService } from '../cache/cache.service';

@Module({
  controllers: [UserController],
  providers: [UserService, LocationService, CacheService],
})
export class UserModule {}
