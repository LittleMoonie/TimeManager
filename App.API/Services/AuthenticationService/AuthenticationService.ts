import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { RegisterDto } from "../../Dtos/Authentication/RegisterDto";
import { LoginDto } from "../../Dtos/Authentication/LoginDto";
import { AuthResponse, UserDto } from "../../Dtos/Users/UserDto";
import User from "../../Entities/Users/User";
import { AuthenticationError, NotFoundError } from "../../Errors/HttpErrors";
import * as argon2 from "argon2";
import { sign } from "jsonwebtoken";
import { add } from "date-fns";
import { UserStatusService } from "../User/UserStatusService";
import { ActiveSessionService } from "../User/ActiveSessionService";
import ActiveSession from "../../Entities/Users/ActiveSessions";
import { v4 as uuidv4 } from "uuid";

@Service()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ActiveSession)
    private activeSessionRepository: Repository<ActiveSession>,
    private userStatusService: UserStatusService,
    private activeSessionService: ActiveSessionService,
  ) {}

  public async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new AuthenticationError("Email already exists");
    }

    const hashedPassword = await argon2.hash(registerDto.password);

    const defaultUserStatus =
      await this.userStatusService.getUserStatusByCode("ACTIVE");
    if (!defaultUserStatus) {
      throw new NotFoundError("Default user status not found");
    }

    const user = this.userRepository.create({
      ...registerDto,
      passwordHash: hashedPassword,
      status: defaultUserStatus,
      companyId: registerDto.companyId,
      roleId: registerDto.roleId,
      phoneNumber: registerDto.phoneNumber,
    });

    return this.userRepository.save(user);
  }

  public async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ["status", "company", "role"],
    });

    if (!user || !(await argon2.verify(user.passwordHash, loginDto.password))) {
      throw new AuthenticationError("Wrong credentials");
    }

    if (!user.status || !user.status.canLogin) {
      throw new AuthenticationError(
        "User account is not active or cannot log in",
      );
    }

    const token = sign(
      { id: user.id, companyId: user.company.id, role: user.role.name },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );
    const refreshToken = await this.generateRefreshToken(
      user.id,
      ipAddress,
      userAgent,
    );
    await this.activeSessionService.createActiveSession(
      user.company.id,
      user.id,
      refreshToken,
      ipAddress,
      userAgent,
    );

    user.lastLogin = new Date();
    await this.userRepository.save(user);

    const userResponse: UserDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyId: user.company.id,
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            timezone: user.company.timezone,
          }
        : undefined,
      roleId: user.role.id,
      statusId: user.status.id,
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
      createdAt: user.createdAt,
      phone: user.phoneNumber,
      lastLogin: user.lastLogin,
    };

    return {
      token,
      user: userResponse,
    };
  }

  public async logout(token: string): Promise<void> {
    await this.activeSessionService.revokeActiveSession(token);
    await this.activeSessionService.updateLastSeen(token);
  }

  public async getCurrentUser(token: string): Promise<User> {
    const activeSession =
      await this.activeSessionService.getActiveSessionByToken(token);
    if (!activeSession) {
      throw new NotFoundError("Active session not found");
    }
    return activeSession.user;
  }

  private async generateRefreshToken(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    const expires = add(new Date(), { days: 7 });
    const deviceId = uuidv4();
    const refreshToken = this.activeSessionRepository.create({
      userId,
      expiresAt: expires,
      ip: ipAddress,
      userAgent,
      deviceId: deviceId,
    });
    await this.activeSessionRepository.save(refreshToken);
    return refreshToken.tokenHash;
  }
}
