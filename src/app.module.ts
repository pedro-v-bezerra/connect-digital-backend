import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { AbacatePayService } from './integrations/abacatepay.service';
import { EvolutionService } from './integrations/evolution.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService, AbacatePayService, EvolutionService],
})
export class AppModule {}
