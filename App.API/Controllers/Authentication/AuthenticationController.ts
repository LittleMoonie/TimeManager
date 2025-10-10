import { Body, Controller, Post, Route, Tags, Response, SuccessResponse, Security, Request, Get } from 'tsoa';
import { validate } from 'class-validator';
import { Request as ExpressRequest } from 'express';
import logger from '../../Utils/Logger';
import { LoginDto } from '../../Dto/Authentication/LoginDto';
import { RegisterDto } from '../../Dto/Authentication/RegisterDto';
import { AuthenticationService } from '../../Service/AuthenticationService/AuthenticationService'; // Placeholder for now
import { ApiResponse } from '../../Dto/Users/UserDto'; // Assuming ApiResponse is generic enough

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
  public async login(@Body() requestBody: LoginDto): Promise<ApiResponse> {
    const loginDto = new LoginDto();
    Object.assign(loginDto, requestBody);

    const errors = await validate(loginDto);
    if (errors.length > 0) {
      this.setStatus(422);
      throw new Error(`Validation error: ${errors.map(e => e.toString()).join(', ')}`);
    }

    try {
      const result = await this.authenticationService.login(requestBody);
      if (!result.success) {
        this.setStatus(401);
        return { success: false, msg: result.msg ?? 'Unauthorized' };
      }
      return { success: true, msg: result.msg ?? 'Login successful' };
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
      const token = request.headers.authorization?.replace('Bearer ', '') || request.body?.token;
      
      if (!token) {
        this.setStatus(401);
        return { success: false, msg: 'No token provided' };
      }

      const result = await this.authenticationService.logout(token);
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
  public async getCurrentUser(@Request() request: ExpressRequest): Promise<ApiResponse> {
    try {
      if (!request.user) {
        this.setStatus(401);
        return { success: false, msg: 'User not authenticated' };
      }
      const user = request.user as User;
      return { success: true, msg: 'Current user retrieved successfully', data: user };
    } catch (err) {
      logger.error('❌ Get current user error:', err);
      this.setStatus(500);
      throw new Error('Internal server error');
    }
  }
}
