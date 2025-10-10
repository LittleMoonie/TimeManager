import logger from '../../Utils/Logger';
import { Body, Controller, Post, Route, Tags, Response, SuccessResponse, Security, Request, Get, Path, Put, Delete } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { validate } from 'class-validator';

import User from '../../Entity/Users/User';
import {
  ApiResponse,
  UserResponse,
} from '../../Dto/Users/UserDto';
import { UserService } from '../../Service/User/UserService';
import { AuthenticationService } from '../../Service/AuthenticationService/AuthenticationService';
import { CreateUserDto } from '../../Dto/Users/CreateUserDto';
import { UpdateUserDto } from '../../Dto/Users/UpdateUserDto';
import { Role } from '../../Entity/Users/Role';
import { UserStatus } from '../../Entity/Users/UserStatus';

@Route('users')
@Tags('Users')
export class UserController extends Controller {
  private readonly authenticationService: AuthenticationService;
  private readonly userService: UserService;

  constructor() {
    super();
    this.authenticationService = new AuthenticationService();
    this.userService = new UserService();
  }



  /**
   * Create a new user (Admin/Manager only)
   * @param requestBody User creation data
   * @returns Created user
   */
  @Post('/')
  @Security('jwt', ['admin', 'manager'])
  @SuccessResponse('201', 'User created successfully')
  @Response<ApiResponse>('400', 'Bad Request')
  @Response<ApiResponse>('401', 'Authentication required')
  @Response<ApiResponse>('403', 'Forbidden')
  @Response<ApiResponse>('422', 'Validation error')
  @Response<ApiResponse>('500', 'Internal server error')
  public async createUser(@Body() requestBody: CreateUserDto, @Request() request: ExpressRequest): Promise<UserResponse> {
    const createUserDto = new CreateUserDto();
    Object.assign(createUserDto, requestBody);

    const errors = await validate(createUserDto);
    if (errors.length > 0) {
      this.setStatus(422);
      throw new Error(`Validation error: ${errors.map(e => e.toString()).join(', ')}`);
    }

    try {
      if (!request.user) {
        this.setStatus(401);
        throw new Error('User not authenticated');
      }
      const { id: userId, orgId, role } = request.user;
      const newUser = await this.userService.createUser(requestBody, userId, role);
      this.setStatus(201);
      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        orgId: newUser.orgId,
        role: newUser.role as Role  ,
        status: newUser.status as UserStatus,
        createdAt: newUser.createdAt,
      };
    } catch (err: any) {
      logger.error('❌ Create user error:', err);
      this.setStatus(err.message.includes('exists') || err.message.includes('Organization not found') ? 400 : 500);
      throw new Error(err.message);
    }
  }

  /**
   * Get user by ID
   * @param id The user's ID
   * @returns User data
   */
  @Get('/{id}')
  @Security('jwt', ['admin', 'manager', 'employee'])
  @SuccessResponse('200', 'User retrieved successfully')
  @Response<ApiResponse>('401', 'Authentication required')
  @Response<ApiResponse>('403', 'Forbidden')
  @Response<ApiResponse>('404', 'User not found')
  @Response<ApiResponse>('500', 'Internal server error')
  public async getUser(@Path() id: string, @Request() request: ExpressRequest): Promise<UserResponse> {
    try {
      if (!request.user) {
        this.setStatus(401);
        throw new Error('User not authenticated');
      }
      const { id: actingUserId, orgId, role: actingUserRole } = request.user;
      
      // Allow employee to get their own profile
      if (actingUserRole === Role.EMPLOYEE && actingUserId !== id) {
        this.setStatus(403);
        throw new Error('Forbidden: Employees can only view their own profile');
      }

      const user = await this.userService.getUserById(id, orgId);
      if (!user) {
        this.setStatus(404);
        throw new Error('User not found');
      }
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        orgId: user.orgId,
        role: user.role as Role,
        status: user.status,
        createdAt: user.createdAt,
      };
    } catch (err: any) {
      logger.error('❌ Get user error:', err);
      this.setStatus(err.message.includes('Forbidden') ? 403 : 500);
      throw new Error(err.message);
    }
  }

  /**
   * Update user by ID (Admin/Manager only)
   * @param id The user's ID
   * @param requestBody User update data
   * @returns Updated user data
   */
  @Put('/{id}')
  @Security('jwt', ['admin', 'manager'])
  @SuccessResponse('200', 'User updated successfully')
  @Response<ApiResponse>('400', 'Bad Request')
  @Response<ApiResponse>('401', 'Authentication required')
  @Response<ApiResponse>('403', 'Forbidden')
  @Response<ApiResponse>('404', 'User not found')
  @Response<ApiResponse>('422', 'Validation error')
  @Response<ApiResponse>('500', 'Internal server error')
  public async updateUser(@Path() id: string, @Body() requestBody: UpdateUserDto, @Request() request: ExpressRequest): Promise<UserResponse> {
    const updateUserDto = new UpdateUserDto();
    Object.assign(updateUserDto, requestBody);

    const errors = await validate(updateUserDto);
    if (errors.length > 0) {
      this.setStatus(422);
      throw new Error(`Validation error: ${errors.map(e => e.toString()).join(', ')}`);
    }

    try {
      if (!request.user) {
        this.setStatus(401);
        throw new Error('User not authenticated');
      }
      const { id: actingUserId, orgId, role: actingUserRole } = request.user;
      const updatedUser = await this.userService.updateUser(id, requestBody, actingUserId, actingUserRole, orgId);
      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        orgId: updatedUser.orgId,
        role: updatedUser.role as Role,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
      };
    } catch (err: any) {
      logger.error('❌ Update user error:', err);
      this.setStatus(err.message.includes('not found') ? 404 : err.message.includes('Manager cannot change') ? 403 : 500);
      throw new Error(err.message);
    }
  }

  /**
   * Delete user by ID (Admin/Manager only)
   * @param id The user's ID
   * @returns Success message
   */
  @Delete('/{id}')
  @Security('jwt', ['admin', 'manager'])
  @SuccessResponse('200', 'User deleted successfully')
  @Response<ApiResponse>('401', 'Authentication required')
  @Response<ApiResponse>('403', 'Forbidden')
  @Response<ApiResponse>('404', 'User not found')
  @Response<ApiResponse>('500', 'Internal server error')
  public async deleteUser(@Path() id: string, @Request() request: ExpressRequest): Promise<ApiResponse> {
    try {
      if (!request.user) {
        this.setStatus(401);
        throw new Error('User not authenticated');
      }
      const { id: actingUserId, orgId, role: actingUserRole } = request.user;
      await this.userService.deleteUser(id, actingUserId, actingUserRole, orgId);
      return { success: true, msg: 'User deleted successfully' };
    } catch (err: any) {
      logger.error('❌ Delete user error:', err);
      this.setStatus(err.message.includes('not found') ? 404 : err.message.includes('Manager cannot delete') ? 403 : 500);
      throw new Error(err.message);
    }
  }

  @Security('jwt', ['manager', 'admin'])
  @Post('/{id}/weekend-permit')
  @SuccessResponse('200', 'Weekend permit granted successfully')
  @Response<ApiResponse>('401', 'Authentication required')
  @Response<ApiResponse>('403', 'Forbidden')
  @Response<ApiResponse>('404', 'User not found')
  @Response<ApiResponse>('500', 'Internal server error')
  public async grantWeekendPermit(@Path() id: string, @Request() request: ExpressRequest): Promise<ApiResponse> {
    try {
      if (!request.user) {
        this.setStatus(401);
        throw new Error('User not authenticated');
      }
      const { id: approverId, orgId, role } = request.user;
      if (role !== Role.MANAGER && role !== Role.ADMIN) {
        this.setStatus(403);
        return { success: false, msg: 'Forbidden: Only managers and admins can grant weekend permits' };
      }

      await this.userService.grantWeekendPermit(id, approverId, orgId);

      return { success: true, msg: 'Weekend permit granted successfully' };
    } catch (err) {
      logger.error('❌ Grant weekend permit error:', err);
      this.setStatus(500);
      throw new Error('Internal server error');
    }
  }

  @Security('jwt', ['manager', 'admin'])
  @Post('/{id}/retro-edit')
  @SuccessResponse('200', 'Retroactive edit applied successfully')
  @Response<ApiResponse>('401', 'Authentication required')
  @Response<ApiResponse>('403', 'Forbidden')
  @Response<ApiResponse>('404', 'User not found')
  @Response<ApiResponse>('500', 'Internal server error')
  public async retroEdit(@Path() id: string, @Body() changes: Record<string, any>, @Request() request: ExpressRequest): Promise<ApiResponse> {
    try {
      if (!request.user) {
        this.setStatus(401);
        throw new Error('User not authenticated');
      }
      const { id: approverId, orgId, role } = request.user;
      if (role !== Role.MANAGER && role !== Role.ADMIN) {
        this.setStatus(403);
        return { success: false, msg: 'Forbidden: Only managers and admins can perform retroactive edits' };
      }

      await this.userService.retroEdit(id, approverId, orgId, changes);

      return { success: true, msg: 'Retroactive edit applied successfully' };
    } catch (err) {
      logger.error('❌ Retroactive edit error:', err);
      this.setStatus(500);
      throw new Error('Internal server error');
    }
  }
}