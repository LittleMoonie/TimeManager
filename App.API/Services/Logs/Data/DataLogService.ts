import { Service } from "typedi";
import { DataLog, DataLogAction } from "../../../Entities/Logs/Data/DataLog";
import { AppDataSource } from "../../../Server/Database";

@Service()
export class DataLogService {
  private dataLogRepository = AppDataSource.getRepository(DataLog);

  public async log(
    companyId: string,
    action: DataLogAction,
    entityType: string,
    entityId: string,
    userId?: string,
    oldValue?: object,
    newValue?: object,
    description?: string,
  ): Promise<void> {
    await this.dataLogRepository.save({
      companyId,
      userId,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      description,
    });
  }

  public async getLogs(companyId: string): Promise<DataLog[]> {
    return this.dataLogRepository.find({ where: { companyId } });
  }
}
