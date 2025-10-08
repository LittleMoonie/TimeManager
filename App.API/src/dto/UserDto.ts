/**
 * User Data Transfer Objects for API requests and responses
 */

export interface RegisterUserRequest {
  /** User's email address */
  email: string;
  /** User's username (4-15 alphanumeric characters) */
  username?: string;
  /** User's password */
  password: string;
}

export interface LoginUserRequest {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

export interface UserResponse {
  /** User's unique identifier */
  id: string;
  /** User's username */
  username: string;
  /** User's email address */
  email: string;
  /** Account creation date */
  createdAt: Date;
}

export interface AuthResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** JWT token for authentication */
  token?: string;
  /** User information */
  user?: UserResponse;
  /** Response message */
  msg?: string;
}

export interface RegisterResponse {
  /** Whether the registration was successful */
  success: boolean;
  /** ID of the newly created user */
  userID?: string;
  /** Response message */
  msg: string;
}

export interface ApiResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Response message */
  msg: string;
}
