import { Module } from '@nestjs/common';
import { DeliverymanDocumentController } from './deliveryman-document.controller';
import { DeliverymanDocumentService } from './deliveryman-document.service';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [FileStorageModule, PrismaModule],
  controllers: [DeliverymanDocumentController],
  providers: [DeliverymanDocumentService],
})
export class DeliverymanDocumentModule {}
