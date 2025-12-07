import { Body, Controller, Delete, Get, Path, Post, Put, Route, Security, Tags, Request } from 'tsoa';
import { Inject, Service } from 'typedi';
import { Request as ExpressRequest } from 'express';

import { ActionCodeCategoryResponseDto, CreateActionCodeCategoryDto, UpdateActionCodeCategoryDto } from '../../Dtos/Timesheet/ActionCodeCategoryDto';
import { ActionCodeCategoryService } from '../../Services/Timesheet/ActionCodeCategoryService';
import User from '../../Entities/Users/User';

@Route('action-code-categories')
@Tags('Action Code Categories')
@Security('jwt')
@Service()
export class ActionCodeCategoryController extends Controller {
  @Inject()
  private readonly categoryService!: ActionCodeCategoryService;

  @Get()
  public async getAll(@Request() request: ExpressRequest): Promise<ActionCodeCategoryResponseDto[]> {
    const me = request.user as User;
    const { companyId } = me;
    const categories = await this.categoryService.getAll(companyId);
    return categories.map(category => ({ id: category.id, name: category.name }));
  }

  @Get('{id}')
  public async getById(@Request() request: ExpressRequest, @Path() id: string): Promise<ActionCodeCategoryResponseDto> {
    const me = request.user as User;
    const { companyId } = me;
    const category = await this.categoryService.getById(companyId, id);
    return { id: category.id, name: category.name };
  }

  @Post()
  public async create(@Request() request: ExpressRequest, @Body() dto: CreateActionCodeCategoryDto): Promise<ActionCodeCategoryResponseDto> {
    const me = request.user as User;
    const { companyId } = me;
    const category = await this.categoryService.create(companyId, dto);
    return { id: category.id, name: category.name };
  }

  @Put('{id}')
  public async update(@Request() request: ExpressRequest, @Path() id: string, @Body() dto: UpdateActionCodeCategoryDto): Promise<ActionCodeCategoryResponseDto> {
    const me = request.user as User;
    const { companyId } = me;
    const category = await this.categoryService.update(companyId, id, dto);
    return { id: category.id, name: category.name };
  }

  @Delete('{id}')
  public async delete(@Request() request: ExpressRequest, @Path() id: string): Promise<void> {
    const me = request.user as User;
    const { companyId } = me;
    await this.categoryService.delete(companyId, id);
  }
}
