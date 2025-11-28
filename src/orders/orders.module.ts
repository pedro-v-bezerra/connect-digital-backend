import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AbacatePayService } from '../integrations/abacatepay.service';
import { EvolutionService } from '../integrations/evolution.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, AbacatePayService, EvolutionService],
})
export class OrdersModule {}
