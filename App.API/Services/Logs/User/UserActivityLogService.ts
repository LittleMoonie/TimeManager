import { Service } from "typedi";
import { AppDataSource } from "../../../Server/Database";
import { UserActivityLog } from "../../../Entities/Logs/Users/UserActivityLog";
import { CreateUserActivityLogDto } from "../../../Dtos/Logs/User/UserActivityLogDto";

@Service()
export class UserActivityLogService {
  private userActivityLogRepository =
    AppDataSource.getRepository(UserActivityLog);

  public async log(
    companyId: string,
    createUserActivityLogDto: CreateUserActivityLogDto,
  ): Promise<void> {
    await this.userActivityLogRepository.save({
      companyId,
      ...createUserActivityLogDto,
    });
  }

  public async getLogs(companyId: string): Promise<UserActivityLog[]> {
    return this.userActivityLogRepository.find({ where: { companyId } });
  }
}
