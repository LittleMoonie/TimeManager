import Container, { Service } from 'typedi';

import { ActionCodeCategory } from '../../Entities/Timesheets/ActionCodeCategory';
import { BaseRepository } from '../../Repositories/BaseRepository';

@Service('ActionCodeCategoryRepository')
export class ActionCodeCategoryRepository extends BaseRepository<ActionCodeCategory> {
  constructor() {
    super(ActionCodeCategory);
  }

  async findAllInCompany(companyId: string): Promise<ActionCodeCategory[]> {
    return this.repository.find({ where: { companyId } });
  }
}

Container.set('ActionCodeCategoryRepository', new ActionCodeCategoryRepository());
