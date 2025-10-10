import { getAuthUser } from '../utils/auth';
import logger from '../utils/logger';
import bcrypt from 'bcryptjs';
import { Body, Controller, Post, Route, Tags, Response, SuccessResponse, Security, Request, Get, Path } from 'tsoa';
import jwt from 'jsonwebtoken';
import { Request as ExpressRequest } from 'express';
import { validate } from 'class-validator';

import ActiveSession from '../models/activeSession';
import User from '../models/user';
import { Organization } from '../models/organization';
import { AppDataSource } from '../server/database';
import {
  RegisterUserRequest,
  LoginUserRequest,
  RegisterResponse,
  AuthResponse,
  ApiResponse,
  UserResponse,
} from '../dto/UserDto';
import { UserService } from '../services/userService';

@Route('users')
@Tags('Users')
export class UserController extends Controller {
  private getAuthUser(request: ExpressRequest): { userId: string; orgId: string; role: string } {
    if (!request.user) {
      throw new Error("User not authenticated");
    }
    const user = request.user as User;
    return {
      userId: user.id,
      orgId: user.orgId,
      role: user.role,
    };
  }

  /**
   * Register a new user and organization
   * @param requestBody User registration data
   * @returns Registration result
   */
  @Post('/register')
  @SuccessResponse('200', 'User registered successfully')
  @Response<ApiResponse>('422', 'Validation error')
  @Response<ApiResponse>('400', 'Email already exists')
  @Response<ApiResponse>('500', 'Internal server error')
  public async registerUser(@Body() requestBody: RegisterUserRequest): Promise<RegisterResponse> {
    const registerUserRequest = new RegisterUserRequest();
    registerUserRequest.email = requestBody.email;
    registerUserRequest.name = requestBody.name;
    registerUserRequest.password = requestBody.password;
    registerUserRequest.orgName = requestBody.orgName;

    const errors = await validate(registerUserRequest);
    if (errors.length > 0) {
      this.setStatus(422);
      throw new Error(`Validation error: ${errors.map(e => e.toString()).join(', ')}`);
    }

    const { email, password, name, orgName } = requestBody;
    const userRepository = AppDataSource.getRepository(User);
    const orgRepository = AppDataSource.getRepository(Organization);

    try {
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        this.setStatus(400);
        return {
          success: false,
          msg: 'Email already exists'
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const organization = orgRepository.create({ name: orgName });
      const savedOrg = await orgRepository.save(organization);

      const newUser = userRepository.create({
        name,
        email,
        password: hashedPassword,
        organization: savedOrg,
        role: 'admin',
        orgId: savedOrg.id,
      });
      const savedUser = await userRepository.save(newUser);

      return {
        success: true,
        userID: savedUser.id,
        msg: 'The user was successfully registered',
      };
    } catch (err) {
      logger.error('❌ Register error:', err);
      this.setStatus(500);
      throw new Error('Internal server error');
    }
  }

  /**
   * Login user and get JWT token
   * @param requestBody User login credentials
   * @returns Authentication result with JWT token
   */
  @Post('/login')
  @SuccessResponse('200', 'User logged in successfully')
  @Response<ApiResponse>('422', 'Validation error')
  @Response<ApiResponse>('401', 'Wrong credentials')
  @Response<ApiResponse>('500', 'Internal server error')
  public async loginUser(@Body() requestBody: LoginUserRequest): Promise<AuthResponse> {
    const loginUserRequest = new LoginUserRequest();
    loginUserRequest.email = requestBody.email;
    loginUserRequest.password = requestBody.password;

    const errors = await validate(loginUserRequest);
    if (errors.length > 0) {
      this.setStatus(422);
      throw new Error(`Validation error: ${errors.map(e => e.toString()).join(', ')}`);
    }

    const { email, password } = requestBody;
    const userRepository = AppDataSource.getRepository(User);
    const activeSessionRepository = AppDataSource.getRepository(ActiveSession);

    try {
      const user = await userRepository.findOne({ where: { email } });
      if (!user?.password) {
        this.setStatus(401);
        return {
          success: false,
          msg: 'Wrong credentials'
        };
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        this.setStatus(401);
        return {
          success: false,
          msg: 'Wrong credentials'
        };
      }

      if (!process.env.SECRET) {
        throw new Error('SECRET not provided');
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, orgId: user.orgId, role: user.role },
        process.env.SECRET,
        { expiresIn: 86400 } // 1 day
      );

      await activeSessionRepository.save({ userId: user.id, token });

      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        orgId: user.orgId,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      };

      return {
        success: true,
        token,
        user: userResponse
      };
    } catch (err) {
      logger.error('❌ Login error:', err);
      this.setStatus(500);
      throw new Error('Internal server error');
    }
  }

  /**
   * Logout user and invalidate token
   * @param request Express request object containing headers
   * @returns Logout result
   */
  @Post('/logout')
  @Security('jwt')
  @SuccessResponse('200', 'User logged out successfully')
  @Response<ApiResponse>('401', 'Authentication required')
  @Response<ApiResponse>('500', 'Internal server error')
  public async logoutUser(@Request() request: ExpressRequest): Promise<ApiResponse> {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '') || request.body?.token;
      
      if (!token) {
        this.setStatus(401);
        return {
          success: false,
          msg: 'No token provided'
        };
      }

      const activeSessionRepository = AppDataSource.getRepository(ActiveSession);
      await activeSessionRepository.delete({ token });

      return {
        success: true,
        msg: 'User logged out successfully'
      };
    } catch (err) {
      logger.error('❌ Logout error:', err);
      this.setStatus(500);
      throw new Error('Internal server error');
    }
  }

  /**
   * Get current user
   * @param request Express request object containing headers
   * @returns Current user
   */
  @Get('/current')
  @Security('jwt')
  @SuccessResponse('200', 'Current user retrieved successfully')
  @Response<ApiResponse>('401', 'Authentication required')
  @Response<ApiResponse>('500', 'Internal server error')
  public async getCurrentUser(@Request() request: ExpressRequest): Promise<AuthResponse> {
    try {
      const authenticatedUser = this.getAuthUser(request);
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: authenticatedUser.userId } });

      if (!user) {
        logger.error('❌ User not found for authenticated ID:', authenticatedUser.userId);
        this.setStatus(401);
        return {
          success: false,
          msg: 'User not found'
        };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          status: user.status,
          role: user.role,
          orgId: user.orgId,
        }
      };
    } catch (err) {
      logger.error('❌ Get current user error:', err);
      this.setStatus(500);
      throw new Error('Internal server error');
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
      const { userId: approverId, orgId, role } = this.getAuthUser(request);
      if (role !== 'manager' && role !== 'admin') {
        this.setStatus(403);
        return { success: false, msg: 'Forbidden: Only managers and admins can grant weekend permits' };
      }

      const userService = new UserService();
      await userService.grantWeekendPermit(id, approverId, orgId);

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
      const { userId: approverId, orgId, role } = this.getAuthUser(request);
      if (role !== 'manager' && role !== 'admin') {
        this.setStatus(403);
        return { success: false, msg: 'Forbidden: Only managers and admins can perform retroactive edits' };
      }

      const userService = new UserService();
      await userService.retroEdit(id, approverId, orgId, changes);

      return { success: true, msg: 'Retroactive edit applied successfully' };
    } catch (err) {
      logger.error('❌ Retroactive edit error:', err);
      this.setStatus(500);
      throw new Error('Internal server error');
    }
  }
}