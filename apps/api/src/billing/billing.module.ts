import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { FileStorageService } from '../file-storage/file-storage.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [BillingService, FileStorageService],
  controllers: [BillingController],
})
export class BillingModule {}
