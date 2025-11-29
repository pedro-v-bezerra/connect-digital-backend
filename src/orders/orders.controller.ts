import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo pedido e inicia o fluxo de pagamento via Pix',
    description:
      'Recebe os dados do cliente e do pedido, cria a ordem e retorna as informações necessárias para pagamento (Pix).',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiCreatedResponse({
    description:
      'Pedido criado com sucesso. Retorna dados do Pix para pagamento.',
    schema: {
      example: {
        orderId: 'd6f2dab9-5acd-4c76-ad76-2adf7b54cbb6',
        status: 'pending',
        pix: {
          copyPasteKey: '000201010211...',
          qrCodeImageUrl: 'https://exemplo.com/qrcode.png',
          expiresAt: '2025-11-30T12:00:00.000Z',
        },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Consulta o status de pagamento de um pedido',
    description:
      'Verifica o status atual do pagamento de um pedido, consultando o provedor de pagamento quando necessário.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do pedido',
    example: 'd6f2dab9-5acd-4c76-ad76-2adf7b54cbb6',
  })
  @ApiOkResponse({
    description: 'Status do pedido retornado com sucesso.',
    schema: {
      example: {
        orderId: 'd6f2dab9-5acd-4c76-ad76-2adf7b54cbb6',
        status: 'approved',
        expiresAt: '2025-11-30T12:00:00.000Z',
      },
    },
  })
  async getStatus(@Param('id') id: string) {
    const payment = await this.ordersService.checkStatus(id);

    return {
      orderId: payment.orderId,
      status: payment.status,
      expiresAt: payment.expiresAt,
    };
  }

  @Post(':id/simulate-payment')
  @ApiOperation({
    summary:
      'Simula a confirmação de pagamento de um pedido (apenas para testes)',
    description:
      'Endpoint auxiliar para ambiente de testes, permitindo simular a aprovação do pagamento de um pedido.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do pedido a ser simulado',
    example: 'd6f2dab9-5acd-4c76-ad76-2adf7b54cbb6',
  })
  @ApiOkResponse({
    description:
      'Pagamento simulado com sucesso. Retorna o status atualizado do pedido.',
    schema: {
      example: {
        orderId: 'd6f2dab9-5acd-4c76-ad76-2adf7b54cbb6',
        status: 'approved',
        expiresAt: '2025-11-30T12:00:00.000Z',
      },
    },
  })
  async simulatePayment(@Param('id') id: string) {
    const result = await this.ordersService.simulatePayment(id);

    return {
      orderId: result.orderId,
      status: result.status,
      expiresAt: result.expiresAt,
    };
  }
}
