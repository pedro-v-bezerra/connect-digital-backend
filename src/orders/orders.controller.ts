import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    const { order, pix } = await this.ordersService.create(dto);

    return {
      orderId: order.id,
      status: order.status,
      pix: {
        copyPasteKey: pix.copyPasteKey,
        qrCodeImageUrl: pix.qrCodeImageUrl,
        expiresAt: pix.expiresAt,
      },
    };
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    const payment = await this.ordersService.checkStatus(id);

    return {
      orderId: payment.orderId,
      status: payment.status,
      expiresAt: payment.expiresAt,
    };
  }

  @Post(':id/simulate-payment')
  async simulatePayment(@Param('id') id: string) {
    const result = await this.ordersService.simulatePayment(id);

    return {
      orderId: result.orderId,
      status: result.status,
      expiresAt: result.expiresAt,
    };
  }
}
