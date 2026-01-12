import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GpsModule } from './gps/gps.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { VehicleTypeModule } from './vehicle-type/vehicle-type.module';
import { DeliveryModule } from './delivery/delivery.module';
import { LocationService } from './location/location.service';
import { UserModule } from './user/user.module';
import { CacheService } from './cache/cache.service';
import { RateLimitMiddleware } from './rate-limit/rate-limit.middleware';
import { BillingModule } from './billing/billing.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { FileStorageService } from './file-storage/file-storage.service';
import { jwtModuleConfig } from './config/jwt.config';
import { DeliverymanDocumentModule } from './deliveryman-document/deliveryman-document.module';
import { DeliverymanBankAccountModule } from './deliveryman-bank-account/deliveryman-bank-account.module';
import { DeliverymanModule } from './deliveryman/deliveryman.module';
import { NotificationModule } from './notification/notification.module';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [
    AuthModule,
    GpsModule,
    JwtModule.registerAsync({
      useFactory: jwtModuleConfig,
    }),
    VehicleTypeModule,
    DeliveryModule,
    UserModule,
    DeliverymanDocumentModule,
    DeliverymanBankAccountModule,
    BillingModule,
    FileStorageModule,
    DeliverymanModule,
    NotificationModule,
    CompanyModule,
  ],
  controllers: [AppController],
  providers: [AppService, CacheService, LocationService, FileStorageService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: '/auth/*path', method: RequestMethod.ALL },
        { path: '/vehicle-types', method: RequestMethod.GET },
        { path: '/', method: RequestMethod.GET },
      )
      .forRoutes('*');

    // Rate limiting aplicado em todas as rotas EXCETO /auth/refresh e /notifications
    consumer
      .apply(RateLimitMiddleware)
      .exclude(
        { path: '/auth/refresh', method: RequestMethod.POST }, // Excluir refresh para evitar 429 durante renovação
        { path: '/notifications', method: RequestMethod.GET }, // Excluir notificações para evitar 429 durante polling
        { path: '/', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
