import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface CreatePixChargeParams {
  amount: number;
  description: string;
}

interface AbacatePixResponse {
  txid: string;
  pixCopiaECola?: string;
  pixCopyPaste?: string;
  copyPaste?: string;
  qrCodeImageUrl?: string;
  qrcodeImageUrl?: string;
}

interface CreatePixChargeResult {
  txid: string;
  copyPasteKey: string;
  qrCodeImageUrl?: string;
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

    const response$ = this.http.post<AbacatePixResponse>(
      url,
      {
        amount: params.amount,
        description: params.description,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const { data } = await firstValueFrom(response$);

    return {
      txid: data.txid,
      copyPasteKey:
        data.pixCopiaECola ?? data.pixCopyPaste ?? data.copyPaste ?? '',
      qrCodeImageUrl: data.qrCodeImageUrl ?? data.qrcodeImageUrl ?? undefined,
    };
  }

  async simulatePayment(txid: string): Promise<AbacatePixResponse> {
    const url = `${this.baseUrl}/pix/charges/${txid}/simulate`;

    const response$ = this.http.post<AbacatePixResponse>(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      },
    );

    const { data } = await firstValueFrom(response$);

    return data;
  }
}
