export type OrderStatus = 'pending' | 'paid';

export interface PixInfo {
  txid: string;
  copyPasteKey: string;
  qrCodeImageUrl?: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  cpf: string;
  phone: string;
  productName: string;
  amount: number; // em centavos (10000 = R$ 100,00)
  address: string;
  status: OrderStatus;
  pix: PixInfo;
  createdAt: Date;
  updatedAt: Date;
}
