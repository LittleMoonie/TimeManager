import { AppDataSource } from "../Server/Database";
import { DeepPartial, FindOneOptions, Repository } from "typeorm";
import { BaseEntity } from "../Entities/BaseEntity";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export class BaseRepository<T extends BaseEntity> {
  protected repository: Repository<T>;

  constructor(entity: new () => T) {
    this.repository = AppDataSource.getRepository(entity);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findById(id: string): Promise<T | null> {
    const options: FindOneOptions<T> = {
      where: { id },
    } as FindOneOptions<T>;
    return this.repository.findOne(options);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    await this.repository.update(
      id,
      data as unknown as QueryDeepPartialEntity<T>,
    );
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
