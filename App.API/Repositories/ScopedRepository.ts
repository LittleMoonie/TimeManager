import { BaseRepository } from "./BaseRepository";
import { BaseEntity } from "../Entities/BaseEntity";
import { FindOptionsWhere } from "typeorm";

export class ScopedRepository<T extends BaseEntity & { companyId?: string; userId?: string }> 
  extends BaseRepository<T> {

  /**
   * Finds all entities within the given company scope.
   */
  async findAllInCompany(companyId: string): Promise<T[]> {
    return this.repository.find({
      where: { companyId } as FindOptionsWhere<T>,
    });
  }

  /**
   * Finds an entity by ID within the user's company scope.
   */
  async findByIdInCompany(id: string, companyId: string, withDeleted = false): Promise<T | null> {
    return this.repository.findOne({
      where: { id, companyId } as FindOptionsWhere<T>,
      withDeleted,
    });
  }

  /**
   * Finds an entity owned by a specific user (for self-service access).
   */
  async findByUser(id: string, userId: string): Promise<T | null> {
    return this.repository.findOne({
      where: { id, userId } as FindOptionsWhere<T>,
    });
  }
}
