import { Service } from "typedi";
import {
  WebhookLog,
  WebhookLogType,
} from "../../../Entities/Logs/Webhooks/WebhookLog";
import { AppDataSource } from "../../../Server/Database";

@Service()
export class WebhookLogService {
  private webhookLogRepository = AppDataSource.getRepository(WebhookLog);

  public async log(
    companyId: string,
    type: WebhookLogType,
    event: string,
    payload?: object,
    response?: object,
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
    });
  }

  public async getLogs(companyId: string): Promise<WebhookLog[]> {
    return this.webhookLogRepository.find({ where: { companyId } });
  }
}
