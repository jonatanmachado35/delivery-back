import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { FileStorageService } from '../file-storage/file-storage.service';
import { AdminOrCompanyGuard } from '../admin/admin-or-company.guard';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [BillingService, FileStorageService, AdminOrCompanyGuard],
  controllers: [BillingController],
})
export class BillingModule {}
