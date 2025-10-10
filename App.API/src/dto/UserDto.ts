/**
 * User Data Transfer Objects for API requests and responses
 */


import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class RegisterUserRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  orgName!: string;
}

export class LoginUserRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class UserResponse {
  id!: string;
  email!: string;
  name!: string;
  createdAt!: Date;
}

export class AuthResponse {
  success!: boolean;
  token?: string;
  user?: UserResponse;
  msg?: string;
}

export class RegisterResponse {
  success!: boolean;
  userID?: string;
  msg!: string;
}

export class ApiResponse {
  success!: boolean;
  msg!: string;
}
