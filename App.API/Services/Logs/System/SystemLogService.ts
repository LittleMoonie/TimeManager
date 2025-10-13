import { Service } from "typedi";
import { SystemLog } from "../../../Entities/Logs/System/SystemLog";
import { AppDataSource } from "../../../Server/Database";
import { CreateSystemLogDto } from "../../../Dtos/Logs/System/SystemLogDto";

@Service()
export class SystemLogService {
  private systemLogRepository = AppDataSource.getRepository(SystemLog);

  public async log(
    companyId: string,
    createSystemLogDto: CreateSystemLogDto,
  ): Promise<void> {
    await this.systemLogRepository.save({
      companyId,
      ...createSystemLogDto,
    });
  }

  public async getLogs(companyId: string): Promise<SystemLog[]> {
    return this.systemLogRepository.find({ where: { companyId } });
  }
}
