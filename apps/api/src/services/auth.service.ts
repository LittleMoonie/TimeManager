import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Redis } from 'ioredis';
import { config } from '../config';
import { prisma } from '@ncy-8/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const redis = new Redis(config.redis.url);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: string;
  organizationId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async login(credentials: LoginCredentials, ipAddress?: string, userAgent?: string): Promise<AuthTokens> {
    const { email, password } = credentials;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizationMembers: {
          where: { deletedAt: null },
          take: 1,
        },
      },
    });

    if (!user) {
      await this.logLoginAttempt(email, ipAddress, false);
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      await this.logLoginAttempt(email, ipAddress, false);
      throw new AppError('Invalid credentials', 401);
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      throw new AppError('Account is not active', 401);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful login
    await this.logLoginAttempt(email, ipAddress, true);

    logger.info({
      userId: user.id,
      email: user.email,
      ipAddress,
    }, 'User logged in successfully');

    return tokens;
  }

  async register(data: RegisterData): Promise<{ user: any; tokens: AuthTokens }> {
    const { email, password, name, role = 'EMPLOYEE', organizationId } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role as any,
        status: 'ACTIVE',
      },
    });

    // Add to organization if provided
    if (organizationId) {
      await prisma.organizationMember.create({
        data: {
          organizationId,
          userId: user.id,
          role: 'MEMBER',
        },
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    logger.info({
      userId: user.id,
      email: user.email,
    }, 'User registered successfully');

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
      
      // Find session
      const session = await prisma.session.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new AppError('Invalid or expired refresh token', 401);
      }

      // Generate new tokens
      const tokens = await this.generateTokens(session.user);

      // Update session with new refresh token
      await prisma.session.update({
        where: { id: session.id },
        data: {
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid refresh token', 401);
      }
      throw error;
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Remove specific session
      await prisma.session.deleteMany({
        where: {
          userId,
          refreshToken,
        },
      });
    } else {
      // Remove all user sessions
      await prisma.session.deleteMany({
        where: { userId },
      });
    }

    logger.info({ userId }, 'User logged out');
  }

  private async generateTokens(user: any): Promise<AuthTokens> {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'ncy-8-api',
      audience: 'ncy-8-client',
    });

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    return { accessToken, refreshToken };
  }

  private async logLoginAttempt(email: string, ipAddress?: string, success: boolean = false): Promise<void> {
    await prisma.loginAttempt.create({
      data: {
        email,
        ipAddress,
        success,
      },
    });
  }
}
