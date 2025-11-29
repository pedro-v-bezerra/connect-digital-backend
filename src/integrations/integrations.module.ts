import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AbacatePayService } from './abacatepay.service';
import { EvolutionService } from './evolution.service';

@Module({
  imports: [HttpModule],
  providers: [AbacatePayService, EvolutionService],
  exports: [AbacatePayService, EvolutionService],
})
export class IntegrationsModule {}
