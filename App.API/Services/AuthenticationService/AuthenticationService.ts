import { Inject, Service } from 'typedi';
import { add } from 'date-fns';
import { sign } from 'jsonwebtoken';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
} from '../../Dtos/Authentication/AuthenticationDto';
import { UserResponseDto } from '../../Dtos/Users/UserResponseDto';

import User from '../../Entities/Users/User';

import { AuthenticationError, NotFoundError } from '../../Errors/HttpErrors';
import { UserStatusService } from '../../Services/Users/UserStatusService';
import { ActiveSessionService } from '../../Services/Users/ActiveSessionService';
import { AuthenticationRepository } from '../../Repositories/Authentication/AuthenticationRepository';
import { UserStatus } from '../../Entities/Users/UserStatus';

/**
 * @description Service layer for handling user authentication processes, including registration, login, logout,
 * and managing active sessions. It orchestrates interactions between repositories and other services
 * to provide secure authentication flows.
 */
@Service()
export class AuthenticationService {
  /**
   * @description Initializes the AuthenticationService with necessary repositories and services.
   * @param authRepo The repository for authentication-related database operations.
   * @param userStatusService The service for managing user statuses.
   * @param activeSessionService The service for managing active user sessions.
   */
  constructor(
    @Inject('AuthenticationRepository') private readonly authRepo: AuthenticationRepository,
    @Inject('UserStatusService') private readonly userStatusService: UserStatusService,
    @Inject('ActiveSessionService') private readonly activeSessionService: ActiveSessionService,
  ) {}

  /**
   * @description Registers a new user in the system.
   * @param registerDto The data transfer object containing new user registration details.
   * @returns A Promise that resolves to the newly created User entity.
   * @throws {AuthenticationError} If a user with the provided email already exists.
   * @throws {NotFoundError} If the default user status (ACTIVE) is not found.
   */
  public async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.authRepo.findUserByEmailWithAuthRelations(registerDto.email);
    if (existingUser) {
      throw new AuthenticationError('Email already exists');
    }

    const hashedPassword = await argon2.hash(registerDto.password);

    const defaultUserStatus = await this.userStatusService.getUserStatusByCode('ACTIVE');
    if (!defaultUserStatus) {
      throw new NotFoundError('Default user status not found');
    }

    const user = new User();
    user.email = registerDto.email;
    user.firstName = registerDto.firstName;
    user.lastName = registerDto.lastName;
    user.passwordHash = hashedPassword;
    user.companyId = registerDto.companyId;
    user.roleId = registerDto.roleId;
    user.statusId = registerDto.statusId;
    user.phoneNumber = registerDto.phoneNumber;
    user.status = defaultUserStatus as UserStatus;

    return this.authRepo.saveUser(user);
  }

  /**
   * @description Authenticates a user with provided credentials, issues a JWT access token, and generates a secure refresh token.
   * @param loginDto The data transfer object containing user login credentials (email and password).
   * @param ipAddress Optional: The IP address from which the login request originated.
   * @param userAgent Optional: The user agent string of the client.
   * @returns A Promise that resolves to an AuthResponseDto containing the JWT token and the authenticated user's profile.
   * @throws {AuthenticationError} If credentials are wrong, the user account is inactive, or JWT secret is not configured.
   * @throws {NotFoundError} If the user is not found during the authentication process.
   */
  public async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const user = await this.authRepo.findUserByEmailWithAuthRelations(loginDto.email);

    if (!user || !(await argon2.verify(user.passwordHash, loginDto.password))) {
      throw new AuthenticationError('Wrong credentials');
    }

    if (!user.status || !user.status.canLogin) {
      throw new AuthenticationError('User account is not active or cannot log in');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AuthenticationError('JWT secret is not configured');
    }

    // Access token (JWT)
    const token = sign(
      { id: user.id, companyId: user.companyId, role: user.role?.name },
      jwtSecret,
      { expiresIn: '1d' },
    );

    // Refresh token: return raw token to caller; store only hash
    const {
      rawToken: _refreshTokenRaw,
      tokenHash,
      deviceId,
      expiresAt,
    } = await this.generateRefreshTokenMaterial();

    await this.activeSessionService.createActiveSession(
      user.companyId,
      user.id,
      tokenHash,
      ipAddress,
      userAgent,
      deviceId,
    );

    // Update last login
    user.lastLogin = new Date();
    await this.authRepo.saveUser(user);

    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyId: user.companyId,
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            timezone: user.company.timezone ?? undefined,
          }
        : undefined,
      roleId: user.roleId,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description ?? undefined,
            companyId: user.role.companyId,
          }
        : undefined,
      statusId: user.statusId,
      status: user.status
        ? {
            id: user.status.id,
            code: user.status.code,
            name: user.status.name,
            description: user.status.description ?? undefined,
            canLogin: user.status.canLogin,
            isTerminal: user.status.isTerminal,
          }
        : undefined,
      createdAt: user.createdAt,
      phoneNumber: user.phoneNumber ?? undefined,
      lastLogin: user.lastLogin ?? undefined,
      deletedAt: user.deletedAt ?? undefined,
    };

    return {
      token,
      refreshToken: _refreshTokenRaw,
      user: userResponse,
    };
  }

  /**
   * @description Logs out a user by revoking their refresh token within a specific company scope.
   * @param companyId The unique identifier of the company.
   * @param refreshToken The raw refresh token to be revoked.
   * @returns A Promise that resolves when the logout operation is complete.
   * @throws {NotFoundError} If the active session associated with the refresh token is not found.
   */
  public async logout(companyId: string, refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.activeSessionService.revokeActiveSession(companyId, tokenHash);
    await this.activeSessionService.updateLastSeen(companyId, tokenHash);
  }

  /**
   * @description Resolves the current user's profile from a refresh token within a company scope.
   * @param companyId The unique identifier of the company.
   * @param refreshToken The raw refresh token.
   * @returns A Promise that resolves to the User entity associated with the refresh token.
   * @throws {NotFoundError} If the active session or the user is not found.
   */
  public async getCurrentUser(companyId: string, refreshToken: string): Promise<User> {
    const tokenHash = this.hashToken(refreshToken);
    const active = await this.activeSessionService.getActiveSessionByTokenInCompany(
      companyId,
      tokenHash,
    );

    const user = await this.authRepo.findUserByIdWithBasicRelations(active.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  // ----------------------
  // Helpers
  // ----------------------

  /**
   * @description Generates a new random raw refresh token, hashes it, and returns all necessary material for persistence.
   * @returns A Promise that resolves to an object containing the raw token, its SHA-256 hash, a device ID, and its expiration date.
   */
  private async generateRefreshTokenMaterial(): Promise<{
    rawToken: string;
    tokenHash: string;
    deviceId: string;
    expiresAt: Date;
  }> {
    const rawToken = crypto.randomBytes(48).toString('base64url');
    const tokenHash = this.hashToken(rawToken);
    const deviceId = crypto.randomUUID();
    const expiresAt = add(new Date(), { days: 7 });
    return { rawToken, tokenHash, deviceId, expiresAt };
  }

  /**
   * @description Hashes a raw refresh token using SHA-256 algorithm.
   * @param raw The raw refresh token string.
   * @returns The SHA-256 hash of the raw token as a hexadecimal string.
   */
  private hashToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }
}
