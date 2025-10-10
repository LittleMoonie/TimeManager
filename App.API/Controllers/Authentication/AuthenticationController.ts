import { Body, Controller, Post, Route, Tags, Response, SuccessResponse, Security, Request, Get } from 'tsoa';
import { validate } from 'class-validator';
import { Request as ExpressRequest } from 'express';
import logger from '../../Utils/Logger';
import { LoginDto } from '../../Dto/Authentication/LoginDto';
import { RegisterDto } from '../../Dto/Authentication/RegisterDto';
import { AuthenticationService } from '../../Service/AuthenticationService/AuthenticationService';
import { ApiResponse, AuthResponse, UserResponse } from '../../Dto/Users/UserDto';
import User from '../../Entity/Users/User';

interface LoginResult {
  success: boolean;
  token: string;
  refreshToken?: string;
  expiresAt?: Date;
  user?: UserResponse;
  msg?: string;
}

@Route('auth')
@Tags('Authentication')
export class AuthenticationController extends Controller {
  private readonly authenticationService: AuthenticationService;

  constructor() {
    super();
    this.authenticationService = new AuthenticationService();
  }

  /**
   * Register a new user
   * @param requestBody User registration data
   * @returns Registration result
   */
  @Post('register')
  @SuccessResponse('200', 'User registered successfully')
  @Response<ApiResponse>('422', 'Validation error')
  @Response<ApiResponse>('400', 'Email already exists')
  @Response<ApiResponse>('500', 'Internal server error')
  public async register(@Body() requestBody: RegisterDto): Promise<ApiResponse> {
    const registerDto = new RegisterDto();
    Object.assign(registerDto, requestBody);

    const errors = await validate(registerDto);
    if (errors.length > 0) {
      this.setStatus(422);
      throw new Error(`Validation error: ${errors.map(e => e.toString()).join(', ')}`);
    }

    try {
      const result = await this.authenticationService.register(requestBody);
      if (!result.success) {
        this.setStatus(400);
      }
      return result;
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
  @Post('login')
  @SuccessResponse('200', 'User logged in successfully')
  @Response<ApiResponse>('422', 'Validation error')
  @Response<ApiResponse>('401', 'Wrong credentials')
  @Response<ApiResponse>('500', 'Internal server error')
  public async login(@Body() requestBody: LoginDto, @Request() request: ExpressRequest): Promise<AuthResponse> {
    const loginDto = new LoginDto();
    Object.assign(loginDto, requestBody);

    const errors = await validate(loginDto);
    if (errors.length > 0) {
      this.setStatus(422);
      throw new Error(`Validation error: ${errors.map(e => e.toString()).join(', ')}`);
    }

    try {
      const result: LoginResult = await this.authenticationService.login(requestBody);
      if (!result.success) {
        this.setStatus(401);
        return { success: false, msg: result.msg ?? 'Unauthorized' };
      }

      if (request.res) {
        request.res.cookie('jwt', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
          sameSite: 'Lax',
        });
      }

      // Return AuthResponse without the token in the body
      const { token, ...authResponse } = result;
      return { success: true, msg: authResponse.msg ?? 'Login successful', user: authResponse.user, refreshToken: authResponse.refreshToken, expiresAt: authResponse.expiresAt };
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
  @Post('logout')
  @Security('jwt')
  @SuccessResponse('200', 'User logged out successfully')
  @Response<ApiResponse>('401', 'Authentication required')
  @Response<ApiResponse>('500', 'Internal server error')
  public async logout(@Request() request: ExpressRequest): Promise<ApiResponse> {
    try {
      // Clear HttpOnly cookie
      if (request.res) {
        request.res.clearCookie('jwt', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
        });
      }

      const user = request.user as User;
      const result = await this.authenticationService.logout(user.id);
      
      if (!result.success) {
        this.setStatus(500);
        return { success: false, msg: result.msg ?? 'Logout failed' };
      }
      return { success: true, msg: result.msg ?? 'Logout successful' };
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
  @Get('current')
  @Security('jwt')
  @SuccessResponse('200', 'Current user retrieved successfully')
  @Response<ApiResponse>('401', 'Authentication required')
  @Response<ApiResponse>('500', 'Internal server error')
  public async getCurrentUser(@Request() request: ExpressRequest): Promise<any> {
    try {
      if (!request.user) {
        this.setStatus(401);
        return { success: false, msg: 'User not authenticated' };
      }
      const user = request.user as User;
      return { success: true, user: { id: user.id, email: user.email, name: user.firstName + ' ' + user.lastName, orgId: user.orgId, role: user.role.name, status: user.status.name, createdAt: user.createdAt, phone: user.phone, lastLogin: user.lastLogin } };
    } catch (err) {
      logger.error('❌ Get current user error:', err);
      this.setStatus(500);
      throw new Error('Internal server error');
    }
  }
}
