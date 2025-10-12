import { Service } from "typedi";
import { add } from "date-fns";
import { sign } from "jsonwebtoken";
import * as argon2 from "argon2";
import * as crypto from "crypto";

import { LoginDto, RegisterDto, AuthResponseDto } from "@/Dtos/Authentication/AuthenticationDto";
import { UserResponseDto } from "@/Dtos/Users/UserResponseDto";

import User from "@/Entities/Users/User";

import { AuthenticationError, NotFoundError } from "@/Errors/HttpErrors";
import { UserStatusService } from "@/Services/Users/UserStatusService";
import { ActiveSessionService } from "@/Services/Users/ActiveSessionService";
import { AuthenticationRepository } from "@/Repositories/Authentication/AuthenticationRepository";

/**
 * AuthenticationService
 * - Returns AuthResponseDto with a properly shaped UserResponseDto
 * - Secure refresh token flow (store hash only, return raw token)
 * - Uses company-scoped ActiveSessionService APIs
 */
@Service()
export class AuthenticationService {
  constructor(
    private readonly authRepo: AuthenticationRepository,
    private readonly userStatusService: UserStatusService,
    private readonly activeSessionService: ActiveSessionService,
  ) {}

  /** Register a new user */
  public async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.authRepo.findUserByEmailWithAuthRelations(registerDto.email);
    if (existingUser) {
      throw new AuthenticationError("Email already exists");
    }

    const hashedPassword = await argon2.hash(registerDto.password);

    const defaultUserStatus = await this.userStatusService.getUserStatusByCode("ACTIVE");
    if (!defaultUserStatus) {
      throw new NotFoundError("Default user status not found");
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
    user.status = defaultUserStatus;

    return this.authRepo.saveUser(user);
  }

  /**
   * Login:
   *  - verifies credentials
   *  - issues JWT access token (24h)
   *  - generates a secure refresh token, stores hash in ActiveSession
   *  - returns AuthResponseDto
   */
  public async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const user = await this.authRepo.findUserByEmailWithAuthRelations(loginDto.email);

    if (!user || !(await argon2.verify(user.passwordHash, loginDto.password))) {
      throw new AuthenticationError("Wrong credentials");
    }

    if (!user.status || !user.status.canLogin) {
      throw new AuthenticationError("User account is not active or cannot log in");
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AuthenticationError("JWT secret is not configured");
    }

    // Access token (JWT)
    const token = sign(
      { id: user.id, companyId: user.companyId, role: user.role?.name },
      jwtSecret,
      { expiresIn: "1d" }
    );

    // Refresh token: return raw token to caller; store only hash
    const { rawToken: refreshTokenRaw, tokenHash, deviceId, expiresAt } =
      await this.generateRefreshTokenMaterial();

    await this.activeSessionService.createActiveSession(
      user.companyId,
      user.id,
      tokenHash,
      ipAddress,
      userAgent,
      deviceId
    );

    // Optionally persist a lightweight row for analytics/consistency (not required by ActiveSessionService).
    await this.authRepo.createAndSaveActiveSessionPartial({
      tokenHash,
      deviceId,
      expiresAt,
      userId: user.id,
      companyId: user.companyId,
      lastSeenAt: new Date(),
      userAgent,
      ip: ipAddress,
    });

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
      user: userResponse,
    };
  }

  /**
   * Logout:
   *  - revoke a refresh token in the user's company
   */
  public async logout(companyId: string, refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.activeSessionService.revokeActiveSession(companyId, tokenHash);
    await this.activeSessionService.updateLastSeen(companyId, tokenHash);
  }

  /** Resolve current user from a refresh token within a company scope. */
  public async getCurrentUser(companyId: string, refreshToken: string): Promise<User> {
    const tokenHash = this.hashToken(refreshToken);
    const active = await this.activeSessionService.getActiveSessionByTokenInCompany(companyId, tokenHash);

    const user = await this.authRepo.findUserByIdWithBasicRelations(active.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  // ----------------------
  // Helpers
  // ----------------------

  /** Create a new random raw token, hash it, and return material for persistence. */
  private async generateRefreshTokenMaterial(): Promise<{
    rawToken: string;
    tokenHash: string;
    deviceId: string;
    expiresAt: Date;
  }> {
    const rawToken = crypto.randomBytes(48).toString("base64url");
    const tokenHash = this.hashToken(rawToken);
    const deviceId = crypto.randomUUID();
    const expiresAt = add(new Date(), { days: 7 });
    return { rawToken, tokenHash, deviceId, expiresAt };
  }

  /** Hash raw refresh token using SHA-256. */
  private hashToken(raw: string): string {
    return crypto.createHash("sha256").update(raw).digest("hex");
  }
}
