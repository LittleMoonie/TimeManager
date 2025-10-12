import { AppDataSource } from "../Server/Database";
import {
  DeepPartial,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
  EntityTarget,
} from "typeorm";
import { BaseEntity } from "../Entities/BaseEntity";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { InternalServerError } from "../Errors/HttpErrors";

/**
 * Generic, reusable base repository class for TypeORM entities.
 * Includes CRUD, soft delete, pagination, and error handling.
 *
 * IMPORTANT:
 * - Supports optional DI: pass an injected Repository<T> when available.
 */
export class BaseRepository<T extends BaseEntity> {
  protected repository: Repository<T>;

  /**
   * Create a repository instance for the given entity.
   * @param entity The TypeORM entity target.
   * @param repo (Optional) A pre-initialized TypeORM Repository<T> for DI.
   */
  constructor(entity: EntityTarget<T>, repo?: Repository<T>) {
    this.repository = repo ?? AppDataSource.getRepository<T>(entity);
  }

  /**
   * Create a new entity and persist it to the database.
   * @param data Partial entity fields to initialize the new record.
   * @returns The persisted entity.
   * @throws {InternalServerError} When the insert fails.
   */
  async create(data: DeepPartial<T>): Promise<T> {
    try {
      const entity = this.repository.create(data);
      return await this.repository.save(entity);
    } catch (error) {
      throw new InternalServerError(`Failed to create entity: ${error}`);
    }
  }

  /**
   * Update an existing entity by its id.
   * @param id The entity id to update.
   * @param data Partial fields to update.
   * @returns The updated entity, or null if not found after update.
   * @throws {InternalServerError} When the update fails.
   */
  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    try {
      await this.repository.update(
        { id } as FindOptionsWhere<T>,
        data as QueryDeepPartialEntity<T>
      );
      return this.findById(id);
    } catch (error) {
      throw new InternalServerError(`Failed to update entity ${id}: ${error}`);
    }
  }

  /**
   * Insert or update an entity instance.
   * @param entity The entity instance to save.
   * @returns The saved entity.
   * @throws {InternalServerError} When the save fails.
   */
  async save(entity: T): Promise<T> {
    try {
      return await this.repository.save(entity);
    } catch (error) {
      throw new InternalServerError(`Failed to save entity: ${error}`);
    }
  }

  /**
   * Permanently delete an entity by its id.
   * @param id The id of the entity to delete.
   * @throws {InternalServerError} When the delete operation fails.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete({ id } as FindOptionsWhere<T>);
    } catch (error) {
      throw new InternalServerError(`Failed to delete entity ${id}: ${error}`);
    }
  }

  /**
   * Soft delete an entity (sets deletedAt) by its id.
   * @param id The id of the entity to soft delete.
   * @throws {InternalServerError} When the soft delete fails.
   */
  async softDelete(id: string): Promise<void> {
    try {
      await this.repository.softDelete({ id } as FindOptionsWhere<T>);
    } catch (error) {
      throw new InternalServerError(`Failed to soft delete entity ${id}: ${error}`);
    }
  }

  /**
   * Restore a soft-deleted entity by its id.
   * @param id The id of the entity to restore.
   * @throws {InternalServerError} When the restore fails.
   */
  async restore(id: string): Promise<void> {
    try {
      await this.repository.restore({ id } as FindOptionsWhere<T>);
    } catch (error) {
      throw new InternalServerError(`Failed to restore entity ${id}: ${error}`);
    }
  }

  /**
   * Find a single entity by its id.
   * @param id The entity id.
   * @param withDeleted Whether to include soft-deleted records.
   * @returns The matching entity or null if not found.
   * @throws {InternalServerError} When the query fails.
   */
  async findById(id: string, withDeleted = false): Promise<T | null> {
    try {
      return await this.repository.findOne({
        where: { id } as FindOptionsWhere<T>,
        withDeleted,
      });
    } catch (error) {
      throw new InternalServerError(`Failed to find entity ${id}: ${error}`);
    }
  }

  /**
   * Find all entities (optionally including soft-deleted).
   * @param withDeleted Whether to include soft-deleted records.
   * @returns An array of entities.
   */
  async findAll(withDeleted = false): Promise<T[]> {
    return this.repository.find({ withDeleted });
  }

  /**
   * Find a single entity by arbitrary conditions.
   * @param options TypeORM FindOneOptions<T> (where/relations/etc).
   * @returns The matching entity or null if not found.
   */
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  /**
   * Find entities using pagination (page, limit).
   * @param page The page number (1-based).
   * @param limit The number of records per page.
   * @returns An object with { data, total } where total is the count of all matching rows.
   */
  async findPaginated(page = 1, limit = 10): Promise<{ data: T[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" } as any,
    });
    return { data, total };
  }
}
