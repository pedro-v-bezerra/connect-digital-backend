import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { AbacatePayService } from './integrations/abacatepay.service';
import { EvolutionService } from './integrations/evolution.service';
import { validateEnv } from './validations/validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    HttpModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService, AbacatePayService, EvolutionService],
})
export class AppModule {}
