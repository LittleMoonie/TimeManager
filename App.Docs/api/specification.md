# API Specification

## Overview

This document provides a comprehensive overview of the GoGoTime API specification, including automated documentation generation, endpoint definitions, and integration details.

## Auto-Generated Documentation

### OpenAPI Specification Location

- **Generated Spec**: `App.API/swagger.json`
- **Interactive Documentation**: `http://localhost:4000/api/docs` (Development)
- **TypeScript Client**: `App.Web/src/lib/api/client.ts`

### Generation Process

The API specification is automatically generated using **tsoa** from TypeScript controller decorators:

```typescript
// App.API/Controllers/Authentication/AuthenticationController.ts (Simplified)
import { Body, Controller, Post, Route, Tags, SuccessResponse } from "tsoa";
import { RegisterDto } from "../../Dtos/Authentication/AuthenticationDto";
import { UserResponseDto } from "../../Dtos/Users/UserResponseDto";

@Route("auth")
@Tags("Authentication")
export class AuthenticationController extends Controller {
  @Post("/register")
  @SuccessResponse("201", "User registered successfully")
  public async register(
    @Body() requestBody: RegisterDto,
  ): Promise<UserResponseDto> {
    // Implementation with automatic OpenAPI generation
    return {} as UserResponseDto;
  }
}
```

## API Base Configuration

### Base URLs

| Environment | Base URL | Swagger UI |
|-------------|----------|------------|
| Development | `http://localhost:4000/api` | `http://localhost:4000/api/docs` |
| Staging | `https://api-staging.gogotime.com/api` | `https://api-staging.gogotime.com/api/docs` |
| Production | `https://api.gogotime.com/api` | *Not Available* |

### Authentication

**JWT Bearer Token Authentication**:
```http
Authorization: Bearer <jwt_token>
```

**Security Scheme**:
```json
{
  "jwt": {
    "type": "http",
    "scheme": "bearer",
    "bearerFormat": "JWT",
    "description": "JWT Authorization header using the Bearer scheme."
  }
}
```

## Current API Endpoints

### User Management (`/users`)

#### Register User
- **Endpoint**: `POST /auth/register`
- **Authentication**: None required
- **Request Body**: `RegisterDto`
  ```typescript
  // App.API/Dtos/Authentication/AuthenticationDto.ts (RegisterDto)
  export class RegisterDto {
    email!: string;
    password!: string;
    firstName!: string;
    lastName!: string;
    companyId!: string;
    roleId!: string;
    statusId!: string;
    phoneNumber!: string;
  }
  ```
- **Response**: `UserResponseDto`
  ```typescript
  // App.API/Dtos/Users/UserResponseDto.ts (UserResponseDto)
  export class UserResponseDto {
    id!: string;
    email!: string;
    firstName!: string;
    lastName!: string;
    companyId!: string;
    roleId!: string;
    statusId!: string;
    createdAt!: Date;
    phoneNumber?: string;
    lastLogin?: Date;
    deletedAt?: Date | null;
  }
  ```

#### Login User
- **Endpoint**: `POST /auth/login`
- **Authentication**: None required
- **Request Body**: `LoginDto`
  ```typescript
  // App.API/Dtos/Authentication/AuthenticationDto.ts (LoginDto)
  export class LoginDto {
    email!: string;
    password!: string;
  }
  ```
- **Response**: `AuthResponseDto`
  ```typescript
  // App.API/Dtos/Authentication/AuthenticationDto.ts (AuthResponseDto)
  export class AuthResponseDto {
    token!: string;
    refreshToken!: string;
    user!: UserResponseDto;
  }
  ```

#### Logout User
- **Endpoint**: `POST /auth/logout`
- **Authentication**: JWT Bearer token required
- **Request Body**: None
- **Response**: `ApiResponse`
  ```typescript
  {
    success: boolean;        // Operation success status
    msg: string;             // Response message
  }
  ```

### System Endpoints

#### Health Check
- **Endpoint**: `GET /health`
- **Authentication**: None required
- **Response**:
  ```typescript
  {
    status: string;          // "OK" if healthy
    timestamp: string;       // ISO timestamp
  }
  ```

## Data Transfer Objects (DTOs)

### User DTOs

Our API uses Data Transfer Objects (DTOs) defined with `class-validator` for request validation and `tsoa` for OpenAPI schema generation. Below are the key DTOs for user-related operations.

```typescript
// App.API/Dtos/Authentication/AuthenticationDto.ts (LoginDto)
import { IsEmail, IsString, MinLength } from "class-validator";

/**
 * @description Data transfer object for user login requests.
 */
export class LoginDto {
  @IsEmail()
  public email!: string;

  @IsString()
  @MinLength(6)
  public password!: string;
}

// App.API/Dtos/Authentication/AuthenticationDto.ts (RegisterDto)
import { IsEmail, IsString, MinLength, IsNotEmpty, IsUUID, Matches } from "class-validator";

/**
 * @description Data transfer object for user registration requests.
 */
export class RegisterDto {
  @IsEmail()
  public email!: string;

  @IsString()
  @MinLength(6)
  public password!: string;

  @IsString()
  @IsNotEmpty()
  public firstName!: string;

  @IsString()
  @IsNotEmpty()
  public lastName!: string;

  @IsUUID()
  @IsNotEmpty()
  public companyId!: string;

  @IsUUID()
  @IsNotEmpty()
  public roleId!: string;

  @IsUUID()
  @IsNotEmpty()
  public statusId!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: "phoneNumber must be E.164" })
  public phoneNumber!: string;
}

// App.API/Dtos/Users/UserResponseDto.ts (UserResponseDto)
import { RoleResponse } from "../../Dtos/Roles/RoleDto";
import { CompanyResponseDto } from "../../Dtos/Companies/CompanyDto";
import { UserStatusResponseDto } from "../../Dtos/Users/UserStatusDto";

/**
 * @description Data transfer object for a user response. This DTO should be used when returning user information to clients, never return the entity directly.
 */
export class UserResponseDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  companyId!: string;
  company?: CompanyResponseDto;
  roleId!: string;
  role?: RoleResponse;
  statusId!: string;
  status?: UserStatusResponseDto;
  createdAt!: Date;
  phoneNumber?: string;
  lastLogin?: Date;
  deletedAt?: Date | null;
}

// App.API/Dtos/Authentication/AuthenticationDto.ts (AuthResponseDto)
/**
 * @description Data transfer object for authentication responses, used after successful login, registration, or token refresh.
 */
export class AuthResponseDto {
  token!: string;
  refreshToken!: string;
  user!: UserResponseDto;
}

// App.API/Dtos/Common/ApiResponseDto.ts (ApiResponseDto)
/**
 * @description Data transfer object for a generic successful API response, typically containing a human-readable message.
 */
export class ApiResponseDto {
  message!: string;
}
```

## Frontend SDK Usage

### Type-Safe API Client

The auto-generated TypeScript client provides full type safety and is used as follows:

```typescript
import { apiClient } from '@/lib/api/apiClient';

// Register a new user
const registerResult = await apiClient.authenticationRegister({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: 'securepassword',
  companyId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  roleId: 'r1o2l3e4-i5d6-7890-1234-567890abcdef',
  statusId: 's1t2a3t4-u5s6-7890-1234-567890abcdef',
  phoneNumber: '+15551234567',
});

// Login user (automatically stores JWT token)
const loginResult = await apiClient.authenticationLogin({
  email: 'user@example.com',
  password: 'securepassword'
});

// Logout user (automatically clears JWT token)
const logoutResult = await apiClient.authenticationLogout();
```

### Error Handling

```typescript
import { ApiError } from '@/lib/api/apiClient';

try {
  const result = await apiClient.register(registerData);
  if (result.success) {
    console.log('Registration successful');
  }
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, 'Status:', error.status);
  }
}
```

## Development Workflow

### 1. Update API Routes
```typescript
// Add new endpoint in controller
// App.API/Controllers/Users/UserController.ts (Simplified)
import { Body, Controller, Get, Post, Security, Request, Path, Put, Delete, Query } from "tsoa";
import { UserResponseDto } from "../../Dtos/Users/UserResponseDto";

@Get("/api/users/{userId}")
@Security("jwt")
public async getUser(
  @Path() userId: string,
): Promise<UserResponseDto> {
  // Implementation
  return {} as UserResponseDto;
}
```

### 2. Generate Documentation
```bash
# In App.API directory
yarn api:sync              # Generates spec + frontend client
```

### 3. Validation
```bash
# Validate generated files
yarn typecheck             # TypeScript compilation check
yarn lint                  # ESLint validation
```

## CI/CD Integration

### Automated Generation

The GitHub Actions workflow automatically:
1. Generates OpenAPI specification from code changes
2. Creates TypeScript client for frontend
3. Validates generated files
4. Commits updates to repository
5. Updates documentation in pull requests

### Workflow Triggers

- **Push to main/develop**: Auto-generates and commits updates
- **Pull Request**: Generates spec and adds comment with changes
- **API Changes**: Any modification to `App.API/src/**` triggers generation

## Validation and Quality Assurance

### Automatic Validation

- **JSON Schema**: OpenAPI spec validated for correctness
- **TypeScript Compilation**: Client code must compile without errors
- **API Contract Testing**: Ensures backward compatibility
- **Documentation Review**: Swagger UI validates interactive documentation

### Manual Validation

1. **Swagger UI Review**: Visit `/api/docs` to review generated documentation
2. **Client Testing**: Test generated client in frontend application
3. **Integration Testing**: Validate API contracts with automated tests

## Future Enhancements

### Planned Features

- **API Versioning**: Implement versioned endpoints (`/api/v1`, `/api/v2`)
- **Rate Limiting**: Add rate limiting headers and documentation
- **Pagination**: Standardize pagination patterns across endpoints
- **File Uploads**: Add support for multipart/form-data endpoints
- **WebSocket Documentation**: Document real-time endpoints
- **Webhook Specifications**: Define webhook payload schemas

### Monitoring Integration

- **Request/Response Logging**: Structured logging for API calls
- **Metrics Collection**: Prometheus metrics for endpoint usage
- **Error Tracking**: Integration with error monitoring systems
- **Performance Monitoring**: Response time and throughput tracking

---

## Related Documentation

- **[API_VERSIONING.md](./API_VERSIONING.md)**: Versioning strategy and backward compatibility
- **[AUTH_SECURITY.md](./AUTH_SECURITY.md)**: Authentication and security implementation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: System architecture and design patterns
- **[CI_CD.md](./CI_CD.md)**: Continuous integration and deployment processes

---

*This specification is automatically maintained and updated through the OpenAPI generation system. For the latest interactive documentation, visit the Swagger UI endpoint in your development environment.*
