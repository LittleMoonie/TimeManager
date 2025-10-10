import { AppDataSource } from '../server/database';
import { ActionCode } from '../models/actionCode';
import { Like } from 'typeorm';

interface ActionCodeSearchQuery {
  orgId: string;
  q?: string;
}

export class ActionCodeService {
  private actionCodeRepository = AppDataSource.getRepository(ActionCode);

  public async search({ orgId, q }: ActionCodeSearchQuery): Promise<ActionCode[]> {
    const where: {
      organization: { id: string };
      name?: import("typeorm").FindOperator<string>;
    } = { organization: { id: orgId } };

    if (q) {
      where.name = Like(`%${q}%`);
    }

    return this.actionCodeRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }
}
