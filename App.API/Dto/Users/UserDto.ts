/**
 * User Data Transfer Objects for API requests and responses
 */

import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class UserResponse {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  name!: string;
  orgId!: string;
  role!: string;
  status!: string;
  createdAt!: Date;
  phone?: string;
  lastLogin?: Date;
}

export class AuthResponse {
  success!: boolean;
  token?: string;
  refreshToken?: string;
  expiresAt?: Date;
  user?: UserResponse;
  msg?: string;
}

export class RegisterResponse {
  success!: boolean;
  userID?: string[];
  msg!: string;
}

export class ApiResponse {
  success!: boolean;
  msg!: string;
}