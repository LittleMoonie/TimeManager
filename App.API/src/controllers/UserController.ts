import * as bcrypt from '@node-rs/bcrypt';
import { Body, Controller, Post, Route, Tags, Response, SuccessResponse, Security, Request } from 'tsoa';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { Request as ExpressRequest } from 'express';

import ActiveSession from '../models/activeSession';
import User from '../models/user';
import { AppDataSource } from '../server/database';
import {
  RegisterUserRequest,
  LoginUserRequest,
  RegisterResponse,
  AuthResponse,
  ApiResponse
} from '../dto/UserDto';

// Joi schema for validation
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(4).max(15).optional(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

@Route('users')
@Tags('Users')
export class UserController extends Controller {
  
  /**
   * Register a new user
   * @param requestBody User registration data
   * @returns Registration result
   */
  @Post('/register')
  @SuccessResponse('200', 'User registered successfully')
  @Response<ApiResponse>('422', 'Validation error')
  @Response<ApiResponse>('400', 'Email already exists')
  @Response<ApiResponse>('500', 'Internal server error')
  public async registerUser(@Body() requestBody: RegisterUserRequest): Promise<RegisterResponse> {
    const { error } = userSchema.validate(requestBody);
    if (error) {
      this.setStatus(422);
      throw new Error(`Validation error: ${error.details[0].message}`);
    }

    const { username, email, password } = requestBody;
    const userRepository = AppDataSource.getRepository(User);

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

      const newUser = userRepository.create({
        username: username || email.split('@')[0], // Use email prefix if no username provided
        email,
        password: hashedPassword,
      });
      const savedUser = await userRepository.save(newUser);

      return {
        success: true,
        userID: savedUser.id,
        msg: 'The user was successfully registered',
      };
    } catch (err) {
      console.error('❌ Register error:', err);
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
    const { error } = loginSchema.validate(requestBody);
    if (error) {
      this.setStatus(422);
      throw new Error(`Validation error: ${error.details[0].message}`);
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
        { id: user.id, username: user.username, email: user.email },
        process.env.SECRET,
        { expiresIn: 86400 } // 1 day
      );

      await activeSessionRepository.save({ userId: user.id, token });

      // Hide password in response
      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      };

      return {
        success: true,
        token,
        user: userResponse
      };
    } catch (err) {
      console.error('❌ Login error:', err);
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
      console.error('❌ Logout error:', err);
      this.setStatus(500);
      throw new Error('Internal server error');
    }
  }
}
