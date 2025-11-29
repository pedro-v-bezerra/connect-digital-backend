import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Customer } from 'src/orders/entities/order.entity';

interface CreatePixChargeParams {
  amount: number; // em centavos
  expiresIn: number; // em segundos
  description: string;
  customer: Customer;
  metadata?: Record<string, string>;
}

interface AbacatePixChargeData {
  id: string;
  amount: number;
  status: string;
  devMode: boolean;
  brCode: string;
  brCodeBase64: string;
  platformFee: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

interface AbacatePixChargeResponse {
  data: AbacatePixChargeData;
  error: null | {
    message: string;
    code?: string;
  };
}

export interface AbacatePixStatusData {
  status: string; // ex: 'PENDING', 'PAID'
  expiresAt: string;
}

interface AbacatePixStatusResponse {
  data: AbacatePixStatusData;
  error: null | {
    message: string;
    code?: string;
  };
}

export interface CreatePixChargeResult {
  pixId: string;
  copyPasteKey: string;
  qrCodeImageUrl: string;
  expiresAt: string;
}

@Injectable()
export class AbacatePayService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('ABACATEPAY_BASE_URL') ?? '';
    this.apiKey = this.config.get<string>('ABACATEPAY_API_KEY') ?? '';
  }

  async createPixCharge(
    params: CreatePixChargeParams,
  ): Promise<CreatePixChargeResult> {
    const url = `${this.baseUrl}/v1/pixQrCode/create`;

    const response$ = this.http.post<AbacatePixChargeResponse>(
      url,
      {
        amount: params.amount,
        description: params.description,
        expiresIn: params.expiresIn,
        customer: params.customer,
        metadata: params.metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const { data } = await firstValueFrom(response$);

    if (data.error) {
      const err = data.error;
      throw new Error(
        `Erro ao criar cobrança PIX: ${err.message} (${err.code ?? 'SEM_CODIGO'})`,
      );
    }

    const charge = data.data;

    return {
      pixId: charge.id,
      copyPasteKey: charge.brCode,
      qrCodeImageUrl: charge.brCodeBase64,
      expiresAt: charge.expiresAt,
    };
  }

  async getPixStatus(pixId: string): Promise<AbacatePixStatusData> {
    const url = `${this.baseUrl}/v1/pixQrCode/check?id=${pixId}`;

    const response$ = this.http.get<AbacatePixStatusResponse>(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    const { data } = await firstValueFrom(response$);

    if (data.error) {
      throw new Error(
        `Erro ao buscar status PIX: ${data.error.message} (${data.error.code ?? 'SEM_CODIGO'})`,
      );
    }

    return data.data;
  }

  async simulatePayment(pixId: string): Promise<void> {
    const url = `${this.baseUrl}/v1/pixQrCode/simulate-payment?id=${pixId}`;

    const response$ = this.http.post<AbacatePixChargeResponse>(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const { data } = await firstValueFrom(response$);

    if (data.error) {
      throw new Error(
        `Erro ao simular pagamento PIX: ${data.error.message} (${data.error.code ?? 'SEM_CODIGO'})`,
      );
    }
  }
}
