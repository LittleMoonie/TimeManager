// App.API/Controllers/Authentication/AuthenticationController.ts
import { Request as ExpressRequest } from 'express';
import { Body, Controller, Post, Route, Tags, SuccessResponse, Get, Security, Request } from 'tsoa';
import { Service } from 'typedi';

import { LoginDto, RegisterDto } from '../../Dtos/Authentication/AuthenticationDto'; // unified file
import { UserResponseDto } from '../../Dtos/Users/UserResponseDto';
import { ForbiddenError, NotFoundError } from '../../Errors/HttpErrors';
import { AuthenticationService } from '../../Services/AuthenticationService/AuthenticationService';

@Route('auth')
@Tags('Authentication')
@Service()
export class AuthenticationController extends Controller {
  constructor(private authenticationService: AuthenticationService) {
    /**
     * @description Initializes the AuthenticationController with the AuthenticationService.
     * @param authenticationService The AuthenticationService injected by TypeDI.
     */
    super();
  }

  /**
   * @summary Registers a new user.
   * @param requestBody The registration details for the new user.
   * @returns The newly registered user's details.
   * @throws {UnprocessableEntityError} If validation fails or the email already exists.
   * @throws {NotFoundError} If the default user status is not found.
   */
  @Post('/register')
  @SuccessResponse('201', 'User registered successfully')
  public async register(@Body() requestBody: RegisterDto): Promise<UserResponseDto> {
    const user = await this.authenticationService.register(requestBody);
    this.setStatus(201);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyId: user.companyId,
      roleId: user.roleId,
      statusId: user.statusId,
      createdAt: user.createdAt,
      phoneNumber: user.phoneNumber,
      lastLogin: user.lastLogin,
    };
  }

  /**
   * @summary Logs in a user and returns authentication tokens.
   * @param requestBody The login credentials (email and password).
   * @param request The Express request object, used to get IP and user-agent, and set cookies.
   * @returns An object containing the JWT token and the authenticated user's profile.
   * @throws {UnprocessableEntityError} If validation fails.
   * @throws {AuthenticationError} If credentials are wrong, the user account is inactive, or JWT secret is not configured.
   */
  @Post('/login')
  @SuccessResponse('200', 'User logged in successfully')
  public async login(@Body() requestBody: LoginDto, @Request() request: ExpressRequest) {
    const authResponse = await this.authenticationService.login(
      requestBody,
      request.ip,
      request.headers['user-agent'],
    );

    // Set cookies
    request.res?.cookie('jwt', authResponse.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 1 day (matches JWT expiry)
      sameSite: 'lax',
    });
    request.res?.cookie('refreshToken', authResponse.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    // Return the same payload as before (omit refreshToken from body if you prefer cookie-only)
    return {
      token: authResponse.token,
      user: authResponse.user,
    };
  }

  /**
   * @summary Logs out the current user by revoking their refresh token.
   * @param request The Express request object, used to get refresh token from cookies/headers and user info.
   * @returns A Promise that resolves when the logout is complete.
   * @throws {NotFoundError} If no refresh token is provided or the session is not found.
   */
  @Post('/logout')
  @Security('jwt')
  @SuccessResponse('204', 'User logged out successfully')
  public async logout(@Request() request: ExpressRequest): Promise<void> {
    const refreshToken =
      request.cookies?.refreshToken || (request.headers['x-refresh-token'] as string | undefined);

    if (!refreshToken) {
      throw new NotFoundError('No refresh token provided');
    }

    const companyId = (request.user as UserResponseDto)?.companyId;
    await this.authenticationService.logout(companyId, refreshToken);

    // Clear cookies
    request.res?.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    request.res?.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    this.setStatus(204);
  }

  /**
   * @summary Retrieves the profile of the currently authenticated user.
   * @param request The Express request object, containing the authenticated user's information.
   * @returns The authenticated user's profile.
   * @throws {ForbiddenError} If the user is not authenticated.
   */
  @Get('/current')
  @Security('jwt')
  public async getCurrentUser(@Request() request: ExpressRequest): Promise<UserResponseDto> {
    if (!request.user) {
      throw new ForbiddenError('User not authenticated');
    }
    const { id, companyId } = request.user as UserResponseDto;
    const user = await this.authenticationService.getCurrentUser(id, companyId);

    this.setHeader('Cache-Control', 'no-cache');

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyId: user.companyId,
      roleId: user.roleId,
      statusId: user.statusId,
      createdAt: user.createdAt,
      phoneNumber: user.phoneNumber,
      lastLogin: user.lastLogin,
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            timezone: user.company.timezone,
          }
        : undefined,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description,
            companyId: user.role.companyId,
          }
        : undefined,
      status: user.status
        ? {
            id: user.status.id,
            code: user.status.code,
            name: user.status.name,
            description: user.status.description,
            canLogin: user.status.canLogin,
            isTerminal: user.status.isTerminal,
          }
        : undefined,
    };
  }
}
