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

interface CreatePixChargeResult {
  txid: string;
  copyPasteKey: string;
  qrCodeImageUrl?: string;
}

interface AbacatePixStatusResponse {
  status: string;
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
    const url = `${this.baseUrl}/pix/charges`;

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
      throw new Error(
        `Erro ao criar cobrança PIX: ${data.error.message} (${data.error.code ?? 'SEM_CODIGO'})`,
      );
    }

    const charge = data.data;

    return {
      txid: charge.id,
      copyPasteKey: charge.brCode,
      qrCodeImageUrl: charge.brCodeBase64,
    };
  }

  async simulatePayment(chargeId: string): Promise<AbacatePixChargeData> {
    const url = `${this.baseUrl}/pix/charges/${chargeId}/simulate`;

    const response$ = this.http.post<AbacatePixChargeResponse>(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      },
    );

    const { data } = await firstValueFrom(response$);

    if (data.error) {
      throw new Error(
        `Erro ao simular pagamento PIX: ${data.error.message} (${data.error.code ?? 'SEM_CODIGO'})`,
      );
    }

    return data.data;
  }

  async verifyPayment(chargeId: string): Promise<AbacatePixStatusResponse> {
    const url = `${this.baseUrl}/pixQrCode/check?id=${chargeId}`;

    const response$ = this.http.get<{ data: AbacatePixStatusResponse }>(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    const { data } = await firstValueFrom(response$);

    return data.data;
  }
}
