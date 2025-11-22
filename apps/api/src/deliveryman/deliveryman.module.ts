import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DeliverymanController } from './deliveryman.controller';
import { DeliverymanService } from './deliveryman.service';

@Module({
  imports: [PrismaModule],
  controllers: [DeliverymanController],
  providers: [DeliverymanService],
})
export class DeliverymanModule {}
