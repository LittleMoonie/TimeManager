import Container, { Service } from 'typedi';

import { WebhookLog } from '../../../Entities/Logs/Webhooks/WebhookLog';
import { BaseRepository } from '../../BaseRepository';

@Service('WebhookLogRepository')
export class WebhookLogRepository extends BaseRepository<WebhookLog> {
  constructor() {
    super(WebhookLog);
  }
}

Container.set('WebhookLogRepository', new WebhookLogRepository());
