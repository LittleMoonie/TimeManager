/**
 * Type-safe API client wrapper for GoGoTime API
 * Auto-generated from OpenAPI specification
 */

import { paths } from './client';

// Extract types from the generated client
type ApiPaths = paths;
type RegisterRequest = ApiPaths['/users/register']['post']['requestBody']['content']['application/json'];
type LoginRequest = ApiPaths['/users/login']['post']['requestBody']['content']['application/json'];
type RegisterResponse = ApiPaths['/users/register']['post']['responses']['200']['content']['application/json'];
type LoginResponse = ApiPaths['/users/login']['post']['responses']['200']['content']['application/json'];
type LogoutResponse = ApiPaths['/users/logout']['post']['responses']['200']['content']['application/json'];

export interface ApiConfig {
  baseUrl?: string;
  token?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class GoGoTimeApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(config: ApiConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:4000/api';
    if (config.token) {
      this.token = config.token;
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
  }

  /**
   * Make authenticated HTTP request
   */
  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.msg || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error occurred', 0, error);
    }
  }

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Login user and get JWT token
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Automatically set token if login is successful
    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  /**
   * Logout user and invalidate token
   */
  async logout(): Promise<LogoutResponse> {
    const response = await this.request<LogoutResponse>('/users/logout', {
      method: 'POST',
    });

    // Clear token after successful logout
    if (response.success) {
      this.clearToken();
    }

    return response;
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

// Export a default instance
export const apiClient = new GoGoTimeApiClient();

// Export types for use in components
export type {
  RegisterRequest,
  LoginRequest,
  RegisterResponse,
  LoginResponse,
  LogoutResponse,
};
