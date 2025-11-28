import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    const order = await this.ordersService.create(dto);

    return {
      id: order.id,
      status: order.status,
      pix: order.pix,
    };
  }

  @Get(':id')
  getStatus(@Param('id') id: string) {
    const order = this.ordersService.findOne(id);

    return {
      id: order.id,
      status: order.status,
    };
  }

  @Post(':id/confirm')
  async confirm(@Param('id') id: string) {
    const order = await this.ordersService.confirmPayment(id);

    return {
      id: order.id,
      status: order.status,
    };
  }
}
