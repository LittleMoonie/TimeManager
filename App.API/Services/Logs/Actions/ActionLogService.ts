import { Service } from "typedi";
import { AppDataSource } from "../../../Server/Database";
import {
  ActionLog,
  ActionLogType,
} from "../../../Entities/Logs/Actions/ActionLog";

@Service()
export class ActionLogService {
  private actionLogRepository = AppDataSource.getRepository(ActionLog);

  public async log(
    companyId: string,
    actionType: ActionLogType,
    description: string,
    userId?: string,
    metadata?: object,
  ): Promise<void> {
    await this.actionLogRepository.save({
      companyId,
      userId,
      actionType,
      description,
      metadata,
    });
  }

  public async getLogs(companyId: string): Promise<ActionLog[]> {
    return this.actionLogRepository.find({ where: { companyId } });
  }
}
