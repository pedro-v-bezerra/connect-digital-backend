import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface SendTextMessageParams {
  to: string;
  message: string;
}

interface EvolutionSendTextResponse {
  success: boolean;
  messageId?: string;
  error?: string;
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

    // Aqui usamos o tipo correto
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
    this.logger.debug(`WhatsApp enviado para ${params.to}`);

    return data;
  }
}
