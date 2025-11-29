import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface SendTextMessageParams {
  to: string;
  message: string;
}

interface EvolutionMessageKey {
  remoteJid: string;
  fromMe: boolean;
  id: string;
}

export interface EvolutionSendTextResponse {
  key: EvolutionMessageKey;
  pushName: string | null;
  status: string; // ex: 'PENDING', 'SENT', etc.
  message: {
    conversation?: string;
    [key: string]: any;
  };
  contextInfo?: any;
  messageType: string;
  messageTimestamp: number;
  instanceId: string;
  source: string;
}

@Injectable()
export class EvolutionService {
  private readonly logger = new Logger(EvolutionService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly instance: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('EVOLUTION_BASE_URL') ?? '';
    this.apiKey = this.config.get<string>('EVOLUTION_API_KEY') ?? '';
    this.instance = this.config.get<string>('EVOLUTION_INSTANCE_NAME') ?? '';
  }

  async sendTextMessage(
    params: SendTextMessageParams,
  ): Promise<EvolutionSendTextResponse> {
    const url = `${this.baseUrl}/message/sendText/${this.instance}`;

    const response$ = this.http.post<EvolutionSendTextResponse>(
      url,
      {
        number: params.to,
        text: params.message,
      },
      {
        headers: {
          apikey: this.apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    const { data } = await firstValueFrom(response$);

    this.logger.debug(
      `WhatsApp enviado para ${params.to} (status: ${data.status}, msgId: ${data.key?.id})`,
    );

    return data;
  }

  async sendText(to: string, message: string): Promise<void> {
    await this.sendTextMessage({ to, message });
  }
}
