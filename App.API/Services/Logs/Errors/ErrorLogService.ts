import { Service } from "typedi";
import {
  ErrorLog,
  ErrorLogLevel,
} from "../../../Entities/Logs/Errors/ErrorLog";
import { AppDataSource } from "../../../Server/Database";

@Service()
export class ErrorLogService {
  private errorLogRepository = AppDataSource.getRepository(ErrorLog);

  public async log(
    companyId: string,
    level: ErrorLogLevel,
    message: string,
    userId?: string,
    stack?: string,
    metadata?: object,
  ): Promise<void> {
    await this.errorLogRepository.save({
      companyId,
      userId,
      level,
      message,
      stack,
      metadata,
    });
  }

  public async getLogs(companyId: string): Promise<ErrorLog[]> {
    return this.errorLogRepository.find({ where: { companyId } });
  }
}
