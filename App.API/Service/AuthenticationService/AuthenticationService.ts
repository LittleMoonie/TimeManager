import { AppDataSource } from '../../Server/Database';
import User from '../../Entity/Users/User';
import ActiveSession from '../../Entity/Users/ActiveSession';
import { Organization } from '../../Entity/Company/Company';
import { RegisterDto } from '../../Dto/Authentication/RegisterDto';
import { LoginDto } from '../../Dto/Authentication/LoginDto';
import logger from '../../Utils/Logger';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, AuthResponse, RegisterResponse, UserResponse } from '../../Dto/Users/UserDto';
import { Role } from '../../Entity/Users/Role';
import { UserStatus } from '../../Entity/Users/UserStatus';

interface LoginResult extends AuthResponse {
  token: string;
}

export class AuthenticationService {
  private userRepository = AppDataSource.getRepository(User);
  private activeSessionRepository = AppDataSource.getRepository(ActiveSession);
  private orgRepository = AppDataSource.getRepository(Organization);

  public async register(registerDto: RegisterDto): Promise<any> {
    const { email, password, firstName, lastName } = registerDto;

    try {
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        return {
          success: false,
          msg: 'Email already exists'
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // For now, create a default organization. In a real app, this might be more complex.
      const organization = this.orgRepository.create({ name: `${firstName} ${lastName}'s Organization` });
      const savedOrg = await this.orgRepository.save(organization);

      const newUser = this.userRepository.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        organization: savedOrg,
        orgId: savedOrg.id,
      });
      const savedUser = await this.userRepository.save(newUser);

      return {
        success: true,
        userID: savedUser && [savedUser.id] || [],
        msg: 'The users were successfully registered',
      };
    } catch (err) {
      logger.error('❌ Register error in service:', err);
      throw new Error('Internal server error');
    }
  }

  public async login(loginDto: LoginDto): Promise<LoginResult> {
    const { email, password } = loginDto;

    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user?.password) {
        return {
          success: false,
          msg: 'Wrong credentials',
          token: '', // Dummy token for type compatibility
        };
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return {
          success: false,
          msg: 'Wrong credentials',
          token: '', // Dummy token for type compatibility
        };
      }

      if (!process.env.SECRET) {
        throw new Error('SECRET not provided');
      }

      const tokenExpiresIn = 86400; // 1 day
      const refreshTokenExpiresIn = 604800; // 7 days

      const token = jwt.sign(
        { id: user.id, email: user.email, orgId: user.orgId, role: user.role.name },
        process.env.SECRET,
        { expiresIn: tokenExpiresIn }
      );

      const refreshToken = uuidv4();
      const expiresAt = new Date(Date.now() + refreshTokenExpiresIn * 1000);

      await this.activeSessionRepository.save({ userId: user.id, token, refreshToken, expiresAt });

      user.lastLogin = new Date();
      await this.userRepository.save(user);

      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        name: user.firstName + ' ' + user.lastName,
        firstName: user.firstName,
        lastName: user.lastName,
        orgId: user.orgId,
        role: user.role.name,
        status: user.status.name,
        createdAt: user.createdAt,
        phone: user.phone,
        lastLogin: user.lastLogin,
      };

      return {
        success: true,
        token,
        refreshToken,
        expiresAt,
        user: userResponse
      };
    } catch (err) {
      logger.error('❌ Login error in service:', err);
      throw new Error('Internal server error');
    }
  }

  public async logout(userId: string): Promise<ApiResponse> {
    try {
      await this.activeSessionRepository.delete({ userId });
      return {
        success: true,
        msg: 'User logged out successfully'
      };
    } catch (err) {
      logger.error('❌ Logout error in service:', err);
      throw new Error('Internal server error');
    }
  }

  public async getCurrentUser(token: string): Promise<AuthResponse> {
    try {
      const decoded: any = jwt.verify(token, process.env.SECRET as string);
      const user = await this.userRepository.findOne({ where: { id: decoded.id } });

      if (!user) {
        return {
          success: false,
          msg: 'User not found'
        };
      }

      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        name: user.firstName + ' ' + user.lastName,
        firstName: user.firstName,
        lastName: user.lastName,
        orgId: user.orgId,
        role: user.role.name,
        status: user.status.name,
        createdAt: user.createdAt,
        phone: user.phone,
        lastLogin: user.lastLogin,
      };

      return {
        success: true,
        user: userResponse
      };
    } catch (err) {
      logger.error('❌ Get current user error in service:', err);
      throw new Error('Internal server error');
    }
  }
}
