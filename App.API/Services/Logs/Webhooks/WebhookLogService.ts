import { Inject, Service } from 'typedi';

import { WebhookLog, WebhookLogType } from '../../../Entities/Logs/Webhooks/WebhookLog';
import { WebhookLogRepository } from '../../../Repositories/Logs/Webhooks/WebhookLogRepository';

export class WebhookLogService {
  constructor(
    @Inject('WebhookLogRepository') private readonly webhookLogRepository: WebhookLogRepository,
  ) {}

  public async log(
    companyId: string,
    type: WebhookLogType,
    event: string,
    payload?: Record<string, string>,
    response?: Record<string, string>,
    statusCode?: number,
    url?: string,
    error?: string,
  ): Promise<void> {
    await this.webhookLogRepository.save({
      companyId,
      type,
      event,
      payload,
      response,
      statusCode,
      url,
      error,
    } as WebhookLog);
  }

  public async getLogs(companyId: string): Promise<WebhookLog[]> {
    return this.webhookLogRepository.findAll();
  }
}
