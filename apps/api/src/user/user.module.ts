import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LocationService } from '../location/location.service';
import { CacheService } from '../cache/cache.service';
import { FileStorageModule } from '../file-storage/file-storage.module';

@Module({
  imports: [FileStorageModule],
  controllers: [UserController],
  providers: [UserService, LocationService, CacheService],
})
export class UserModule {}
