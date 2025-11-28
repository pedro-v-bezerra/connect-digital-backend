import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateOrderDto } from './dto/create-order.dto';
import { AbacatePayService } from '../integrations/abacatepay.service';
import { EvolutionService } from '../integrations/evolution.service';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  private readonly orders = new Map<string, Order>();

  constructor(
    private readonly abacatePay: AbacatePayService,
    private readonly evolution: EvolutionService,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const pix = await this.abacatePay.createPixCharge({
      amount: dto.amount,
      description: dto.productName,
    });

    const now = new Date();
    const id = randomUUID();

    const order: Order = {
      id,
      customerName: dto.customerName,
      email: dto.email,
      cpf: dto.cpf,
      phone: dto.phone,
      productName: dto.productName,
      amount: dto.amount,
      address: dto.address,
      status: 'pending',
      pix,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(id, order);

    await this.evolution.sendTextMessage({
      to: order.phone,
      message: this.buildPendingMessage(order),
    });

    return order;
  }

  findOne(id: string): Order {
    const order = this.orders.get(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  markAsPaid(id: string): Order {
    const order = this.findOne(id);
    order.status = 'paid';
    order.updatedAt = new Date();
    this.orders.set(id, order);
    return order;
  }

  async confirmPayment(id: string): Promise<Order> {
    const order = this.markAsPaid(id);

    await this.evolution.sendTextMessage({
      to: order.phone,
      message: 'Obrigado por comprar conosco!',
    });

    return order;
  }

  private buildPendingMessage(order: Order): string {
    const amountReais = (order.amount / 100).toFixed(2).replace('.', ',');

    return (
      `Olá ${order.customerName} aqui é da LOJA X, recebemos o seu pedido e está quase tudo pronto para o envio!\n` +
      `Precisamos apenas da confirmação do pagamento.\n\n` +
      `Detalhes do pedido:\n` +
      `• ${order.productName}\n` +
      `• R$ ${amountReais}\n` +
      `• ${order.address}\n\n` +
      `Pague agora mesmo com o PIX copia e cola abaixo e garanta o seu pedido antes que acabem as últimas unidades:\n` +
      `${order.pix.copyPasteKey}`
    );
  }
}
