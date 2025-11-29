export type OrderStatus = 'pending' | 'paid';

export interface Order {
  id: string;
  customerName: string;
  email: string;
  cpf: string;
  phone: string;
  productName: string;
  amount: number; // em centavos
  address: string;
  status: OrderStatus; // 'pending' | 'paid'
  pixId: string;
  pixExpiresAt: string;
}

export interface Customer {
  name: string;
  email: string;
  taxId: string;
  cellphone: string;
}

export interface PixInfo {
  pixId: string;
  copyPasteKey: string;
  qrCodeImageUrl: string;
  expiresAt: string;
}
