import { validate } from 'class-validator';
import { Inject, Service } from 'typedi';

import { CreateActionCodeCategoryDto, UpdateActionCodeCategoryDto } from '../../Dtos/Timesheet/ActionCodeCategoryDto';
import { ActionCodeCategory } from '../../Entities/Timesheets/ActionCodeCategory';
import { NotFoundError, UnprocessableEntityError } from '../../Errors/HttpErrors';
import { ActionCodeCategoryRepository } from '../../Repositories/Timesheets/ActionCodeCategoryRepository';

@Service()
export class ActionCodeCategoryService {
  constructor(
    @Inject('ActionCodeCategoryRepository') private readonly categoryRepository: ActionCodeCategoryRepository,
  ) {}

  private async ensureValidation(dto: unknown): Promise<void> {
    const errors = await validate(dto as object);
    if (errors.length > 0) {
      throw new UnprocessableEntityError(
        `Validation error: ${errors.map((e) => e.toString()).join(', ')}`,
      );
    }
  }

  public async getAll(companyId: string): Promise<ActionCodeCategory[]> {
    return this.categoryRepository.findAllInCompany(companyId);
  }

  public async getById(companyId: string, id: string): Promise<ActionCodeCategory> {
    const category = await this.categoryRepository.findById(id);
    if (!category || category.companyId !== companyId) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  public async create(companyId: string, dto: CreateActionCodeCategoryDto): Promise<ActionCodeCategory> {
    await this.ensureValidation(dto);
    const created = await this.categoryRepository.create({
      companyId,
      ...dto,
    });
    return created;
  }

  public async update(companyId: string, id: string, dto: UpdateActionCodeCategoryDto): Promise<ActionCodeCategory> {
    await this.ensureValidation(dto);
    const existing = await this.getById(companyId, id);
    const updated = await this.categoryRepository.update(existing.id, dto);
    if (!updated) throw new NotFoundError('Failed to update category');
    return updated;
  }

  public async delete(companyId: string, id: string): Promise<void> {
    await this.getById(companyId, id);
    await this.categoryRepository.delete(id);
  }
}
