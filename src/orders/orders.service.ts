import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  AbacatePayService,
  CreatePixChargeResult,
} from '../integrations/abacatepay.service';
import { EvolutionService } from '../integrations/evolution.service';
import { Order, PixInfo } from './entities/order.entity';
import { buildPendingMessage } from './messages/pending.message';
import { buildPaidMessage } from './messages/paid.message';

@Injectable()
export class OrdersService {
  private readonly orders = new Map<string, Order>();

  constructor(
    private readonly abacatePay: AbacatePayService,
    private readonly evolution: EvolutionService,
  ) {}

  private getOrderOrThrow(orderId: string): Order {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async create(dto: CreateOrderDto): Promise<{ order: Order; pix: PixInfo }> {
    const pixCharge: CreatePixChargeResult =
      await this.abacatePay.createPixCharge({
        amount: dto.amount,
        expiresIn: 600,
        description: dto.productName,
        customer: {
          name: dto.customerName,
          email: dto.email,
          taxId: dto.cpf,
          cellphone: dto.phone,
        },
      });

    const order: Order = {
      id: randomUUID(),
      customerName: dto.customerName,
      email: dto.email,
      cpf: dto.cpf,
      phone: dto.phone,
      productName: dto.productName,
      amount: dto.amount,
      address: dto.address,
      status: 'pending',
      pixId: pixCharge.pixId,
      pixExpiresAt: pixCharge.expiresAt,
    };

    this.orders.set(order.id, order);

    const pix: PixInfo = {
      pixId: pixCharge.pixId,
      copyPasteKey: pixCharge.copyPasteKey,
      qrCodeImageUrl: pixCharge.qrCodeImageUrl,
      expiresAt: pixCharge.expiresAt,
    };

    const pendingMessage = buildPendingMessage(order, pix.copyPasteKey);

    try {
      await this.evolution.sendText(order.phone, pendingMessage);
    } catch (err) {
      console.error('Erro ao enviar mensagem pendente', err);
    }

    return { order, pix };
  }

  async checkStatus(orderId: string) {
    const order = this.getOrderOrThrow(orderId);

    const payment = await this.abacatePay.getPixStatus(order.pixId);

    if (payment.status === 'PAID' && order.status !== 'paid') {
      order.status = 'paid';
      const paidMessage = buildPaidMessage();

      try {
        await this.evolution.sendText(order.phone, paidMessage);
      } catch (err) {
        console.error('Erro ao enviar mensagem de pagamento confirmado', err);
      }
    }

    return {
      orderId: order.id,
      status: payment.status,
      expiresAt: payment.expiresAt,
    };
  }

  async simulatePayment(orderId: string) {
    const order = this.getOrderOrThrow(orderId);

    await this.abacatePay.simulatePayment(order.pixId);

    const payment = await this.abacatePay.getPixStatus(order.pixId);

    return {
      orderId: order.id,
      status: payment.status,
      expiresAt: payment.expiresAt,
    };
  }
}
