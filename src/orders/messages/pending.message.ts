import { Order } from '../entities/order.entity';
export function buildPendingMessage(
  order: Order,
  copyPasteKey: string,
): string {
  const value = (order.amount / 100).toFixed(2).replace('.', ',');

  return (
    `Olá ${order.customerName} aqui é da LOJA X, recebemos o seu pedido e está quase tudo pronto para o envio!\n` +
    `Precisamos apenas da confirmação do pagamento.\n\n` +
    `Detalhes do pedido:\n` +
    `• ${order.productName}\n` +
    `• R$ ${value}\n` +
    `• ${order.address}\n\n` +
    `Pague agora mesmo com o PIX copia e cola abaixo e garanta o seu pedido antes que acabem as últimas unidades:\n\n` +
    `${copyPasteKey}`
  );
}
