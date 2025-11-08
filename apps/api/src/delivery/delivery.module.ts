import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { LocationService } from '../location/location.service';
import { VehicleTypeService } from '../vehicle-type/vehicle-type.service';
import { CacheService } from '../cache/cache.service';

@Module({
  controllers: [DeliveryController],
  providers: [
    CacheService,
    DeliveryService,
    LocationService,
    VehicleTypeService,
  ],
})
export class DeliveryModule {}
