import { Service } from "typedi";
import {
  AuthLog,
  AuthLogAction,
} from "../../../Entities/Logs/Security/AuthLog";
import { AppDataSource } from "../../../Server/Database";

@Service()
export class AuthLogService {
  private authLogRepository = AppDataSource.getRepository(AuthLog);

  public async log(
    companyId: string,
    action: AuthLogAction,
    userId?: string,
    ip?: string,
    userAgent?: string,
    metadata?: object,
  ): Promise<void> {
    await this.authLogRepository.save({
      companyId,
      userId,
      action,
      ip,
      userAgent,
      metadata,
    });
  }

  public async getLogs(companyId: string): Promise<AuthLog[]> {
    return this.authLogRepository.find({ where: { companyId } });
  }
}
