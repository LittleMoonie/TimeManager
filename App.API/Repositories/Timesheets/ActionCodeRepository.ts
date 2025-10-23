import Container, { Service } from 'typedi';
import { ILike } from 'typeorm';

import { ActionCode } from '../../Entities/Timesheets/ActionCode';
import { BaseRepository } from '../../Repositories/BaseRepository';

/**
 * @description Repository for managing ActionCode entities. Extends BaseRepository to provide standard CRUD operations
 * and includes specific methods for querying action codes by code, and searching within a company scope.
 */
@Service('ActionCodeRepository')
export class ActionCodeRepository extends BaseRepository<ActionCode> {
  /**
   * @description Initializes the ActionCodeRepository with a TypeORM Repository instance for ActionCode.
   * @param repo The TypeORM Repository<ActionCode> injected by TypeDI.
   */
  constructor() {
    super(ActionCode);
  }

  /**
   * @description Finds a single action code by its unique code within a specific company.
   * @param companyId The unique identifier of the company.
   * @param code The unique code of the action code to find.
   * @returns A Promise that resolves to the ActionCode entity or null if not found.
   */
  async findByCode(companyId: string, code: string): Promise<ActionCode | null> {
    return this.repository.findOne({ where: { companyId, code } });
  }

  /**
   * @description Finds all action codes belonging to a specific company.
   * @param companyId The unique identifier of the company.
   * @returns A Promise that resolves to an array of ActionCode entities.
   */
  async findAllInCompany(companyId: string): Promise<ActionCode[]> {
    return this.repository.find({ 
      where: { companyId, allowTimeLogging: true },
      relations: ['category'],
    });
  }

  /**
   * @description Searches for action codes within a specific company based on a query string.
   * The search is performed on the name and code fields using a case-insensitive LIKE comparison.
   * @param companyId The unique identifier of the company.
   * @param q Optional: The query string to search for.
   * @returns A Promise that resolves to an array of matching ActionCode entities, ordered by creation date.
   */
  async search(companyId: string, q?: string): Promise<ActionCode[]> {
    if (!q || !q.trim()) return this.findAllInCompany(companyId);
    const term = `%${q.trim()}%`;
    return this.repository.find({
      where: [
        { companyId, name: ILike(term), allowTimeLogging: true },
        { companyId, code: ILike(term), allowTimeLogging: true },
      ],
      relations: ['category'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order: { createdAt: 'DESC' } as any,
    });
  }
}

Container.set('ActionCodeRepository', new ActionCodeRepository());
