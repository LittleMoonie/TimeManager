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
@Route('users')
@Tags('Users')
export class UserController extends Controller {
  @Post('/register')
  @SuccessResponse('200', 'User registered successfully')
  @Response<ApiResponse>('422', 'Validation error')
  public async registerUser(@Body() requestBody: RegisterUserRequest): Promise<RegisterResponse> {
    // Implementation with automatic OpenAPI generation
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
- **Endpoint**: `POST /users/register`
- **Authentication**: None required
- **Request Body**:
  ```typescript
  {
    email: string;           // User's email address
    username?: string;       // Optional username (4-15 alphanumeric)
    password: string;        // User's password
  }
  ```
- **Response**: `RegisterResponse`
  ```typescript
  {
    success: boolean;        // Operation success status
    userID?: string;         // ID of newly created user
    msg: string;             // Response message
  }
  ```

#### Login User
- **Endpoint**: `POST /users/login`
- **Authentication**: None required
- **Request Body**:
  ```typescript
  {
    email: string;           // User's email address
    password: string;        // User's password
  }
  ```
- **Response**: `AuthResponse`
  ```typescript
  {
    success: boolean;        // Operation success status
    token?: string;          // JWT authentication token
    user?: UserResponse;     // User information
    msg?: string;            // Response message
  }
  ```

#### Logout User
- **Endpoint**: `POST /users/logout`
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

```typescript
export interface RegisterUserRequest {
  email: string;
  username?: string;
  password: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserResponse;
  msg?: string;
}

export interface RegisterResponse {
  success: boolean;
  userID?: string;
  msg: string;
}

export interface ApiResponse {
  success: boolean;
  msg: string;
}
```

## Frontend SDK Usage

### Type-Safe API Client

The auto-generated TypeScript client provides full type safety:

```typescript
import { apiClient, RegisterRequest, LoginRequest } from '@/lib/api/apiClient';

// Register a new user
const registerResult = await apiClient.register({
  email: 'user@example.com',
  username: 'johndoe',
  password: 'securepassword'
});

// Login user (automatically stores JWT token)
const loginResult = await apiClient.login({
  email: 'user@example.com',
  password: 'securepassword'
});

// Logout user (automatically clears JWT token)
const logoutResult = await apiClient.logout();
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
@Get('/api/users/{userId}')
@Security('jwt')
public async getUser(@Path() userId: string): Promise<UserResponse> {
  // Implementation
}
```

### 2. Generate Documentation
```bash
# In App.API directory
yarn api:generate          # Generate OpenAPI spec only
yarn api:generate-full     # Generate spec + frontend client
yarn api:sync              # Alias for api:generate-full
```

### 3. Generate Frontend Client
```bash
# In App.Web directory
yarn api:client            # Generate TypeScript client from spec
```

### 4. Validation
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
