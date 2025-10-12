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
 * @description Generic, reusable base repository class for TypeORM entities. Provides common CRUD (Create, Read, Update, Delete)
 * operations, soft deletion capabilities, pagination, and centralized error handling.
 * @template T The TypeORM entity type that extends BaseEntity.
 *
 * IMPORTANT:
 * - Supports optional Dependency Injection (DI): a pre-initialized `Repository<T>` can be passed during construction.
 */
export class BaseRepository<T extends BaseEntity> {
  protected repository: Repository<T>;

  /**
   * @description Creates a new instance of the BaseRepository for a given entity.
   * @param entity The TypeORM entity target (e.g., `User`, `Company`).
   * @param repo Optional: A pre-initialized TypeORM `Repository<T>` instance. If not provided, one will be obtained from `AppDataSource`.
   */
  constructor(entity: EntityTarget<T>, repo?: Repository<T>) {
    this.repository = repo ?? AppDataSource.getRepository<T>(entity);
  }

  /**
   * @description Creates a new entity record in the database and persists it.
   * @param data A partial object containing the fields to initialize the new entity.
   * @returns A Promise that resolves to the newly created and persisted entity.
   * @throws {InternalServerError} If the entity creation or persistence fails due to a database error.
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
   * @description Updates an existing entity identified by its ID with new data.
   * After updating, it attempts to retrieve and return the updated entity.
   * @param id The unique identifier of the entity to update.
   * @param data A partial object containing the fields and their new values to update.
   * @returns A Promise that resolves to the updated entity, or `null` if the entity was not found after the update operation.
   * @throws {InternalServerError} If the update operation fails due to a database error.
   */
  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    try {
      await this.repository.update(
        { id } as FindOptionsWhere<T>,
        data as QueryDeepPartialEntity<T>,
      );
      return this.findById(id);
    } catch (error) {
      throw new InternalServerError(`Failed to update entity ${id}: ${error}`);
    }
  }

  /**
   * @description Saves a given entity instance to the database. This method can be used for both inserting new entities
   * and updating existing ones (if the entity has an ID).
   * @param entity The entity instance to save.
   * @returns A Promise that resolves to the saved entity instance.
   * @throws {InternalServerError} If the save operation fails due to a database error.
   */
  async save(entity: T): Promise<T> {
    try {
      return await this.repository.save(entity);
    } catch (error) {
      throw new InternalServerError(`Failed to save entity: ${error}`);
    }
  }

  /**
   * @description Permanently deletes an entity from the database by its unique identifier. This operation is irreversible.
   * @param id The unique identifier of the entity to delete.
   * @returns A Promise that resolves when the delete operation is complete.
   * @throws {InternalServerError} If the delete operation fails due to a database error.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete({ id } as FindOptionsWhere<T>);
    } catch (error) {
      throw new InternalServerError(`Failed to delete entity ${id}: ${error}`);
    }
  }

  /**
   * @description Soft deletes an entity by setting its `deletedAt` timestamp. The record remains in the database
   * but is typically excluded from standard queries.
   * @param id The unique identifier of the entity to soft delete.
   * @returns A Promise that resolves when the soft delete operation is complete.
   * @throws {InternalServerError} If the soft delete operation fails due to a database error.
   */
  async softDelete(id: string): Promise<void> {
    try {
      await this.repository.softDelete({ id } as FindOptionsWhere<T>);
    } catch (error) {
      throw new InternalServerError(
        `Failed to soft delete entity ${id}: ${error}`,
      );
    }
  }

  /**
   * @description Restores a soft-deleted entity by clearing its `deletedAt` timestamp.
   * @param id The unique identifier of the entity to restore.
   * @returns A Promise that resolves when the restore operation is complete.
   * @throws {InternalServerError} If the restore operation fails due to a database error.
   */
  async restore(id: string): Promise<void> {
    try {
      await this.repository.restore({ id } as FindOptionsWhere<T>);
    } catch (error) {
      throw new InternalServerError(`Failed to restore entity ${id}: ${error}`);
    }
  }

  /**
   * @description Finds a single entity by its unique identifier.
   * @param id The unique identifier of the entity to find.
   * @param withDeleted Optional: If `true`, includes soft-deleted records in the search. Defaults to `false`.
   * @returns A Promise that resolves to the matching entity or `null` if no entity is found.
   * @throws {InternalServerError} If the query operation fails due to a database error.
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
   * @description Retrieves all entities of the repository's type.
   * @param withDeleted Optional: If `true`, includes soft-deleted records in the results. Defaults to `false`.
   * @returns A Promise that resolves to an array of all entities.
   */
  async findAll(withDeleted = false): Promise<T[]> {
    return this.repository.find({ withDeleted });
  }

  /**
   * @description Finds a single entity based on arbitrary TypeORM `FindOneOptions`.
   * This allows for complex queries including `where` conditions, `relations`, `order`, etc.
   * @param options The TypeORM `FindOneOptions<T>` object specifying the query criteria.
   * @returns A Promise that resolves to the matching entity or `null` if no entity is found.
   */
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  /**
   * @description Retrieves a paginated list of entities.
   * @param page The 1-based page number to retrieve. Defaults to `1`.
   * @param limit The maximum number of records to return per page. Defaults to `10`.
   * @returns A Promise that resolves to an object containing the paginated data (`data`) and the total count of entities (`total`).
   */
  async findPaginated(
    page = 1,
    limit = 10,
  ): Promise<{ data: T[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order: { createdAt: "DESC" } as any,
    });
    return { data, total };
  }
}
