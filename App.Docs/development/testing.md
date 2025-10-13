# Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the NCY_8 platform, covering unit tests, integration tests, end-to-end tests, load testing, and security testing using Jest, Playwright, k6, and other testing frameworks.

## Testing Pyramid

```
                    ┌─────────────────┐
                    │   E2E Tests     │
                    │   (Playwright)  │
                    │     ~50 tests   │
                    └─────────────────┘
                ┌─────────────────────────┐
                │   Integration Tests     │
                │   (Jest + Supertest)   │
                │      ~200 tests        │
                └─────────────────────────┘
            ┌─────────────────────────────────┐
            │        Unit Tests               │
            │        (Jest)                   │
            │       ~1000 tests               │
            └─────────────────────────────────┘
```

### Testing Distribution

- **Unit Tests**: 70% - Fast, isolated, comprehensive coverage
- **Integration Tests**: 20% - API endpoints, database interactions
- **E2E Tests**: 10% - Critical user journeys, smoke tests

## Unit Testing

### Jest Configuration

Our backend unit and integration tests are configured using Jest. The `jest.config.js` file in `App.API` defines how tests are discovered, run, and how coverage is collected.

```javascript
// App.API/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: [
    '.interface.ts',
    '.enum.ts',
    '.dto.ts',
    '.module.ts',
    '.mock.ts',
    '.config.ts',
    '.entity.ts',
    '.factory.ts',
    '.schema.ts',
    '.spec.ts',
    '.e2e-spec.ts',
    'main.ts',
    'index.ts',
    'Server/Database.ts',
    'Server/IoC.ts',
    'Server/Auth.ts',
    'Server/Seed.ts',
    'Config/',
    'Errors/',
    'Middlewares/',
    'Migrations/',
    'Repositories/',
    'Routes/',
    'Seeds/',
    'Utils/Logger.ts',
  ],
  testTimeout: 10000,
  verbose: true,
  setupFilesAfterEnv: ['../jest.setup.ts'],
  moduleNameMapper: {
    '^@App.API/(.*)$': '<rootDir>/$1',
  },
};
```

### Service Layer Tests

Service layer tests focus on the business logic in isolation from controllers and repositories. We use Jest for these tests.

```typescript
// App.API/Services/AuthenticationService/AuthenticationService.spec.ts (Simplified)
import { AuthenticationService } from '@App.API/Services/AuthenticationService/AuthenticationService';
import { AuthenticationRepository } from '@App.API/Repositories/Authentication/AuthenticationRepository';
import { UserStatusService } from '@App.API/Services/Users/UserStatusService';
import { ActiveSessionService } from '@App.API/Services/Users/ActiveSessionService';
import { LoginDto, RegisterDto } from '@App.API/Dtos/Authentication/AuthenticationDto';
import User from '@App.API/Entities/Users/User';
import { AuthenticationError, NotFoundError } from '@App.API/Errors/HttpErrors';
import * as argon2 from 'argon2';

// Mock dependencies
jest.mock('@App.API/Repositories/Authentication/AuthenticationRepository');
jest.mock('@App.API/Services/Users/UserStatusService');
jest.mock('@App.API/Services/Users/ActiveSessionService');
jest.mock('argon2');

describe('AuthenticationService', () => {
  let authenticationService: AuthenticationService;
  let authRepo: jest.Mocked<AuthenticationRepository>;
  let userStatusService: jest.Mocked<UserStatusService>;
  let activeSessionService: jest.Mocked<ActiveSessionService>;

  beforeEach(() => {
    authRepo = new AuthenticationRepository(
      null as any,
      null as any,
    ) as jest.Mocked<AuthenticationRepository>;
    userStatusService = new UserStatusService(null as any) as jest.Mocked<UserStatusService>;
    activeSessionService = new ActiveSessionService(
      null as any,
    ) as jest.Mocked<ActiveSessionService>;

    authenticationService = new AuthenticationService(
      authRepo,
      userStatusService,
      activeSessionService,
    );

    // Mock argon2.verify
    (argon2.verify as jest.Mock).mockResolvedValue(true);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        companyId: 'company-uuid',
        roleId: 'role-uuid',
        statusId: 'status-uuid',
        phoneNumber: '+1234567890',
      };

      authRepo.findUserByEmailWithAuthRelations.mockResolvedValue(null);
      userStatusService.getUserStatusByCode.mockResolvedValue({
        id: 'status-uuid',
        code: 'ACTIVE',
        name: 'Active',
        canLogin: true,
        isTerminal: false,
      });
      authRepo.saveUser.mockImplementation(async (user: User) => user);

      const user = await authenticationService.register(registerDto);

      expect(user.email).toBe(registerDto.email);
      expect(authRepo.saveUser).toHaveBeenCalled();
    });

    it('should throw AuthenticationError if email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        companyId: 'company-uuid',
        roleId: 'role-uuid',
        statusId: 'status-uuid',
        phoneNumber: '+1234567890',
      };

      authRepo.findUserByEmailWithAuthRelations.mockResolvedValue(new User());

      await expect(authenticationService.register(registerDto)).rejects.toThrow(
        AuthenticationError,
      );
    });
  });

  // ... other tests for login, logout, etc.
});
```

### Component Tests (Frontend)

```typescript
// tests/components/UserProfile.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfile } from '@/components/UserProfile';
import { UserProvider } from '@/contexts/UserContext';
import { mockUser } from '@/tests/mocks/user';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <UserProvider>
      {component}
    </UserProvider>
  );
};

describe('UserProfile', () => {
  const defaultProps = {
    user: mockUser,
    editable: true,
    onUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render user information', () => {
    renderWithProvider(<UserProfile {...defaultProps} />);

    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(mockUser.role)).toBeInTheDocument();
  });

  it('should show edit form when edit button is clicked', async () => {
    renderWithProvider(<UserProfile {...defaultProps} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });

  it('should call onUpdate when form is submitted', async () => {
    renderWithProvider(<UserProfile {...defaultProps} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(defaultProps.onUpdate).toHaveBeenCalledWith({
        ...mockUser,
        name: 'Updated Name',
      });
    });
  });

  it('should not show edit button when not editable', () => {
    renderWithProvider(
      <UserProfile {...defaultProps} editable={false} />
    );

    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });
});
```

### Utility Function Tests

```typescript
// tests/utils/validation.test.ts
import { validateEmail, validatePassword, validateUserData } from '@/utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'user+tag@example.org'];

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should return false for invalid emails', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        '',
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    it('should return true for strong passwords', () => {
      const strongPasswords = ['SecurePass123!', 'MyP@ssw0rd2024', 'Complex#Password1'];

      strongPasswords.forEach((password) => {
        expect(validatePassword(password)).toBe(true);
      });
    });

    it('should return false for weak passwords', () => {
      const weakPasswords = ['password', '12345678', 'Password', 'P@ssw0rd', 'SecurePass123'];

      weakPasswords.forEach((password) => {
        expect(validatePassword(password)).toBe(false);
      });
    });
  });

  describe('validateUserData', () => {
    it('should validate complete user data', () => {
      const validUserData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        role: 'EMPLOYEE' as const,
      };

      const result = validateUserData(validUserData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return errors for invalid user data', () => {
      const invalidUserData = {
        email: 'invalid-email',
        password: 'weak',
        name: '',
        role: 'INVALID' as any,
      };

      const result = validateUserData(invalidUserData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
      expect(result.errors).toContain('Password is too weak');
      expect(result.errors).toContain('Name is required');
      expect(result.errors).toContain('Invalid role');
    });
  });
});
```

## Integration Testing

### API Endpoint Tests

API endpoint tests verify the integration between controllers, services, and repositories. We use `supertest` with Jest to simulate HTTP requests.

```typescript
// App.API/Tests/Controllers/Authentication/AuthenticationController.test.ts (Simplified)
import request from 'supertest';
import { app } from '../../Server/index'; // Assuming 'app' is your Express app instance
import { AppDataSource } from '../../Server/Database';
import User from '../../Entities/Users/User';
import { UserStatus } from '../../Entities/Users/UserStatus';
import { Role } from '../../Entities/Roles/Role';
import { Company } from '../../Entities/Companies/Company';
import * as argon2 from 'argon2';

describe('AuthenticationController', () => {
  let testUser: User;
  let testCompany: Company;
  let testRole: Role;
  let testStatus: UserStatus;

  beforeAll(async () => {
    await AppDataSource.initialize();

    // Create a test company
    testCompany = await AppDataSource.getRepository(Company).save({
      name: 'Test Company',
    });

    // Create a test role
    testRole = await AppDataSource.getRepository(Role).save({
      name: 'Employee',
      companyId: testCompany.id,
    });

    // Create a test user status
    testStatus = await AppDataSource.getRepository(UserStatus).save({
      code: 'ACTIVE',
      name: 'Active',
      canLogin: true,
    });
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    // Clear user data before each test
    await AppDataSource.getRepository(User).clear();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        companyId: testCompany.id,
        roleId: testRole.id,
        statusId: testStatus.id,
        phoneNumber: '+1234567890',
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toEqual('test@example.com');
    });

    it('should return 422 if email already exists', async () => {
      await AppDataSource.getRepository(User).save({
        email: 'test@example.com',
        passwordHash: await argon2.hash('password123'),
        firstName: 'Existing',
        lastName: 'User',
        companyId: testCompany.id,
        roleId: testRole.id,
        statusId: testStatus.id,
        phoneNumber: '+1234567890',
      });

      const res = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        password: 'newpassword',
        firstName: 'New',
        lastName: 'User',
        companyId: testCompany.id,
        roleId: testRole.id,
        statusId: testStatus.id,
        phoneNumber: '+1234567890',
      });

      expect(res.statusCode).toEqual(422);
      expect(res.body.message).toContain('Validation error');
    });
  });

  // ... other tests for login, logout, etc.
});
```

### Database Integration Tests

Database integration tests verify the interaction between repositories and the database. We use Jest and TypeORM's `AppDataSource` for these tests.

```typescript
// App.API/Repositories/Users/UserRepository.test.ts (Simplified)
import { UserRepository } from '@App.API/Repositories/Users/UserRepository';
import { AppDataSource } from '../../Server/Database';
import User from '@App.API/Entities/Users/User';
import { Company } from '@App.API/Entities/Companies/Company';
import { Role } from '@App.API/Entities/Roles/Role';
import { UserStatus } from '@App.API/Entities/Users/UserStatus';
import * as argon2 from 'argon2';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let testCompany: Company;
  let testRole: Role;
  let testStatus: UserStatus;

  beforeAll(async () => {
    await AppDataSource.initialize();

    testCompany = await AppDataSource.getRepository(Company).save({
      name: 'Test Company',
    });
    testRole = await AppDataSource.getRepository(Role).save({
      name: 'Employee',
      companyId: testCompany.id,
    });
    testStatus = await AppDataSource.getRepository(UserStatus).save({
      code: 'ACTIVE',
      name: 'Active',
      canLogin: true,
    });

    userRepository = new UserRepository(AppDataSource.getRepository(User));
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    await AppDataSource.getRepository(User).clear();
  });

  describe('findByEmailInCompany', () => {
    it('should find user by email and company ID', async () => {
      const user = await AppDataSource.getRepository(User).save({
        email: 'test@example.com',
        passwordHash: await argon2.hash('password123'),
        firstName: 'Test',
        lastName: 'User',
        companyId: testCompany.id,
        roleId: testRole.id,
        statusId: testStatus.id,
        phoneNumber: '+1234567890',
      });

      const foundUser = await userRepository.findByEmailInCompany(
        'test@example.com',
        testCompany.id,
      );

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toEqual(user.email);
    });

    it('should return null if user not found in company', async () => {
      const foundUser = await userRepository.findByEmailInCompany(
        'nonexistent@example.com',
        testCompany.id,
      );
      expect(foundUser).toBeNull();
    });
  });

  describe('findAllByCompanyId', () => {
    it('should return all users for a given company ID', async () => {
      await AppDataSource.getRepository(User).save([
        {
          email: 'user1@example.com',
          passwordHash: await argon2.hash('password123'),
          firstName: 'User',
          lastName: 'One',
          companyId: testCompany.id,
          roleId: testRole.id,
          statusId: testStatus.id,
          phoneNumber: '+1234567890',
        },
        {
          email: 'user2@example.com',
          passwordHash: await argon2.hash('password123'),
          firstName: 'User',
          lastName: 'Two',
          companyId: testCompany.id,
          roleId: testRole.id,
          statusId: testStatus.id,
          phoneNumber: '+1234567890',
        },
      ]);

      const users = await userRepository.findAllByCompanyId(testCompany.id);
      expect(users).toHaveLength(2);
      expect(users[0].companyId).toEqual(testCompany.id);
    });
  });
});
```

## End-to-End Testing

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: [
    {
      command: 'yarn dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'yarn dev:api',
      port: 3001,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

### Authentication Flow Tests

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Sign In');
    await expect(page).toHaveURL('/login');

    // Fill login form
    await page.fill('[data-testid="email-input"]', 'admin@ncy-8.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=Sign In');
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Invalid credentials',
    );
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.click('text=Sign In');
    await page.fill('[data-testid="email-input"]', 'admin@ncy-8.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should redirect to login page
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});
```

### User Management Tests

```typescript
// tests/e2e/user-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@ncy-8.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create new user', async ({ page }) => {
    // Navigate to users page
    await page.click('[data-testid="users-menu"]');
    await expect(page).toHaveURL('/users');

    // Click create user button
    await page.click('[data-testid="create-user-button"]');
    await expect(page.locator('[data-testid="create-user-modal"]')).toBeVisible();

    // Fill user form
    await page.fill('[data-testid="user-name-input"]', 'New Test User');
    await page.fill('[data-testid="user-email-input"]', 'newuser@example.com');
    await page.selectOption('[data-testid="user-role-select"]', 'EMPLOYEE');
    await page.fill('[data-testid="user-password-input"]', 'SecurePass123!');

    // Submit form
    await page.click('[data-testid="create-user-submit"]');

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'User created successfully',
    );

    // User should appear in the list
    await expect(page.locator('[data-testid="user-list"]')).toContainText('New Test User');
  });

  test('should edit existing user', async ({ page }) => {
    await page.click('[data-testid="users-menu"]');

    // Click edit button for first user
    await page.click('[data-testid="edit-user-button"]:first');
    await expect(page.locator('[data-testid="edit-user-modal"]')).toBeVisible();

    // Update user name
    await page.fill('[data-testid="user-name-input"]', 'Updated User Name');
    await page.click('[data-testid="update-user-submit"]');

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    // Updated name should appear in the list
    await expect(page.locator('[data-testid="user-list"]')).toContainText('Updated User Name');
  });

  test('should delete user', async ({ page }) => {
    await page.click('[data-testid="users-menu"]');

    // Click delete button for first user
    await page.click('[data-testid="delete-user-button"]:first');

    // Confirm deletion
    await expect(page.locator('[data-testid="confirm-delete-modal"]')).toBeVisible();
    await page.click('[data-testid="confirm-delete-button"]');

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'User deleted successfully',
    );
  });

  test('should filter users by role', async ({ page }) => {
    await page.click('[data-testid="users-menu"]');

    // Filter by manager role
    await page.selectOption('[data-testid="role-filter"]', 'MANAGER');

    // All visible users should have manager role
    const userRoles = await page.locator('[data-testid="user-role"]').allTextContents();
    userRoles.forEach((role) => {
      expect(role).toBe('MANAGER');
    });
  });
});
```

### Project Management Tests

```typescript
// tests/e2e/project-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'manager@ncy-8.com');
    await page.fill('[data-testid="password-input"]', 'manager123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create new project', async ({ page }) => {
    await page.click('[data-testid="projects-menu"]');
    await page.click('[data-testid="create-project-button"]');

    await page.fill('[data-testid="project-name-input"]', 'New Test Project');
    await page.fill('[data-testid="project-description-input"]', 'This is a test project');
    await page.selectOption('[data-testid="project-status-select"]', 'ACTIVE');

    await page.click('[data-testid="create-project-submit"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-list"]')).toContainText('New Test Project');
  });

  test('should add tasks to project', async ({ page }) => {
    await page.click('[data-testid="projects-menu"]');
    await page.click('[data-testid="project-card"]:first');

    // Add new task
    await page.click('[data-testid="add-task-button"]');
    await page.fill('[data-testid="task-title-input"]', 'New Task');
    await page.fill('[data-testid="task-description-input"]', 'Task description');
    await page.selectOption('[data-testid="task-priority-select"]', 'HIGH');
    await page.click('[data-testid="create-task-submit"]');

    await expect(page.locator('[data-testid="task-list"]')).toContainText('New Task');
  });

  test('should update task status', async ({ page }) => {
    await page.click('[data-testid="projects-menu"]');
    await page.click('[data-testid="project-card"]:first');

    // Update first task status
    await page.click('[data-testid="task-status-select"]:first');
    await page.selectOption('[data-testid="task-status-select"]:first', 'IN_PROGRESS');

    // Status should be updated
    await expect(page.locator('[data-testid="task-status"]:first')).toContainText('IN_PROGRESS');
  });
});
```

## Load Testing

### k6 Configuration

```javascript
// tests/load/k6.config.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'], // Error rate under 10%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'https://api.ncy-8.com';

export default function () {
  // Test user registration
  const registerPayload = JSON.stringify({
    email: `user${Date.now()}@example.com`,
    password: 'SecurePass123!',
    name: `Load Test User ${Date.now()}`,
    role: 'EMPLOYEE',
  });

  const registerParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const registerResponse = http.post(
    `${BASE_URL}/api/v1/auth/register`,
    registerPayload,
    registerParams,
  );

  check(registerResponse, {
    'registration status is 201': (r) => r.status === 201,
    'registration response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  if (registerResponse.status === 201) {
    const userData = JSON.parse(registerResponse.body);
    const token = userData.data.token;

    // Test authenticated endpoints
    const authParams = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    // Get user profile
    const profileResponse = http.get(`${BASE_URL}/api/v1/users/me`, authParams);

    check(profileResponse, {
      'profile status is 200': (r) => r.status === 200,
      'profile response time < 300ms': (r) => r.timings.duration < 300,
    }) || errorRate.add(1);

    // Get projects
    const projectsResponse = http.get(`${BASE_URL}/api/v1/projects`, authParams);

    check(projectsResponse, {
      'projects status is 200': (r) => r.status === 200,
      'projects response time < 400ms': (r) => r.timings.duration < 400,
    }) || errorRate.add(1);
  }

  sleep(1);
}
```

### API Load Tests

```javascript
// tests/load/api-load.test.js
import http from 'k6/http';
import { check, group } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = 'https://api.ncy-8.com';
const ADMIN_TOKEN = __ENV.ADMIN_TOKEN;

export default function () {
  group('User Management API', () => {
    // Get users list
    const usersResponse = http.get(`${BASE_URL}/api/v1/users`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
      },
    });

    check(usersResponse, {
      'users list status is 200': (r) => r.status === 200,
      'users list has data': (r) => {
        const body = JSON.parse(r.body);
        return body.data && Array.isArray(body.data);
      },
    }) || errorRate.add(1);

    // Create user
    const createUserPayload = JSON.stringify({
      email: `loadtest${Date.now()}@example.com`,
      password: 'SecurePass123!',
      name: `Load Test User ${Date.now()}`,
      role: 'EMPLOYEE',
    });

    const createUserResponse = http.post(`${BASE_URL}/api/v1/users`, createUserPayload, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    check(createUserResponse, {
      'create user status is 201': (r) => r.status === 201,
      'create user response time < 800ms': (r) => r.timings.duration < 800,
    }) || errorRate.add(1);
  });

  group('Project Management API', () => {
    // Get projects
    const projectsResponse = http.get(`${BASE_URL}/api/v1/projects`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
      },
    });

    check(projectsResponse, {
      'projects list status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    // Create project
    const createProjectPayload = JSON.stringify({
      name: `Load Test Project ${Date.now()}`,
      description: 'Project created during load testing',
      status: 'ACTIVE',
    });

    const createProjectResponse = http.post(`${BASE_URL}/api/v1/projects`, createProjectPayload, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    check(createProjectResponse, {
      'create project status is 201': (r) => r.status === 201,
    }) || errorRate.add(1);
  });

  group('Health Check', () => {
    const healthResponse = http.get(`${BASE_URL}/health`);

    check(healthResponse, {
      'health check status is 200': (r) => r.status === 200,
      'health check response time < 100ms': (r) => r.timings.duration < 100,
    }) || errorRate.add(1);
  });
}
```

## Security Testing

### Authentication Security Tests

```typescript
// tests/security/auth.security.test.ts
import request from 'supertest';
import { app } from '@/app';

describe('Authentication Security', () => {
  describe('Brute Force Protection', () => {
    it('should block IP after multiple failed login attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Make multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        const response = await request(app).post('/api/v1/auth/login').send(loginData).expect(401);
      }

      // Next attempt should be blocked
      const blockedResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(429);

      expect(blockedResponse.body.error).toContain('Too many attempts');
    });
  });

  describe('Password Security', () => {
    it('should reject weak passwords', async () => {
      const weakPasswords = ['password', '12345678', 'Password', 'P@ssw0rd'];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({
            email: 'test@example.com',
            password,
            name: 'Test User',
          })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
      }
    });

    it('should hash passwords before storing', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };

      await request(app).post('/api/v1/auth/register').send(userData).expect(201);

      // Verify password is hashed in database
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { email: userData.email },
      });

      expect(user?.passwordHash).not.toBe(userData.password);
      expect(user?.passwordHash).toMatch(/^\$2[aby]\$.+/); // bcrypt hash format
    });
  });

  describe('JWT Security', () => {
    it('should reject expired tokens', async () => {
      const expiredToken = generateExpiredToken();

      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error).toBe('Token expired');
    });

    it('should reject malformed tokens', async () => {
      const malformedTokens = ['invalid-token', 'Bearer invalid', 'Bearer ', ''];

      for (const token of malformedTokens) {
        const response = await request(app)
          .get('/api/v1/users/me')
          .set('Authorization', token)
          .expect(401);
      }
    });
  });

  describe('SQL Injection Protection', () => {
    it('should prevent SQL injection in login', async () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users --",
      ];

      for (const input of maliciousInputs) {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: input,
            password: 'password',
          })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
      }
    });
  });

  describe('XSS Protection', () => {
    it('should sanitize user input', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '"><script>alert("xss")</script>',
      ];

      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/v1/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            email: 'test@example.com',
            password: 'SecurePass123!',
            name: payload,
            role: 'EMPLOYEE',
          })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
      }
    });
  });
});
```

### Test Helpers

Test helpers provide utility functions for setting up and tearing down test environments, and generating test data.

```typescript
// App.API/Tests/TestHelper.ts (Simplified)
import { DataSource } from 'typeorm';
import User from '../Entities/Users/User';
import { Company } from '../Entities/Companies/Company';
import { Role } from '../Entities/Roles/Role';
import { UserStatus } from '../Entities/Users/UserStatus';
import * as jwt from 'jsonwebtoken';

export const createTestDataSource = async (): Promise<DataSource> => {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'gogotime_test',
    synchronize: true, // Use synchronize for test databases
    logging: false,
    entities: [User, Company, Role, UserStatus], // Include all relevant entities
  });

  await dataSource.initialize();
  return dataSource;
};

export const cleanupTestDataSource = async (dataSource: DataSource) => {
  await dataSource.dropDatabase();
  await dataSource.destroy();
};

export const generateTestToken = (userId: string, companyId: string, roleName: string) => {
  return jwt.sign(
    {
      id: userId,
      companyId: companyId,
      role: roleName,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' },
  );
};

export const generateExpiredToken = (userId: string, companyId: string, roleName: string) => {
  return jwt.sign(
    {
      id: userId,
      companyId: companyId,
      role: roleName,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '-1h' }, // Expired token
  );
};

export const createTestUser = async (
  dataSource: DataSource,
  company: Company,
  role: Role,
  status: UserStatus,
  overrides: Partial<User> = {},
) => {
  const userRepository = dataSource.getRepository(User);
  const user = userRepository.create({
    email: `testuser-${Date.now()}@example.com`,
    passwordHash: await argon2.hash('password123'),
    firstName: 'Test',
    lastName: 'User',
    companyId: company.id,
    roleId: role.id,
    statusId: status.id,
    phoneNumber: '+1234567890',
    ...overrides,
  });
  return userRepository.save(user);
};

export const createTestCompany = async (
  dataSource: DataSource,
  overrides: Partial<Company> = {},
) => {
  const companyRepository = dataSource.getRepository(Company);
  const company = companyRepository.create({
    name: `Test Company ${Date.now()}`,
    ...overrides,
  });
  return companyRepository.save(company);
};

export const createTestRole = async (
  dataSource: DataSource,
  company: Company,
  overrides: Partial<Role> = {},
) => {
  const roleRepository = dataSource.getRepository(Role);
  const role = roleRepository.create({
    name: `Test Role ${Date.now()}`,
    companyId: company.id,
    ...overrides,
  });
  return roleRepository.save(role);
};

export const createTestUserStatus = async (
  dataSource: DataSource,
  overrides: Partial<UserStatus> = {},
) => {
  const userStatusRepository = dataSource.getRepository(UserStatus);
  const status = userStatusRepository.create({
    code: `STATUS_${Date.now()}`,
    name: `Test Status ${Date.now()}`,
    canLogin: true,
    ...overrides,
  });
  return userStatusRepository.save(status);
};
```

### Mock Data

Mock data is used to provide consistent and predictable data for tests. These mocks should reflect the structure of our TypeORM entities.

```typescript
// tests/mocks/user.ts (Simplified)
import User from '@App.API/Entities/Users/User';
import { Company } from '@App.API/Entities/Companies/Company';
import { Role } from '@App.API/Entities/Roles/Role';
import { UserStatus } from '@App.API/Entities/Users/UserStatus';

export const mockCompany: Company = {
  id: 'company-123',
  name: 'Mock Company',
  timezone: 'UTC',
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
  users: [],
  teams: [],
  actionCodes: [],
  timesheetEntries: [],
  teamMembers: [],
  timesheetHistory: [],
  companySettings: {} as any, // Mock as needed
};

export const mockRole: Role = {
  id: 'role-123',
  name: 'Employee',
  companyId: mockCompany.id,
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
  company: mockCompany,
  description: '',
  rolePermissions: [],
  users: [],
};

export const mockUserStatus: UserStatus = {
  id: 'status-123',
  code: 'ACTIVE',
  name: 'Active',
  canLogin: true,
  isTerminal: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
  users: [],
};

export const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  passwordHash: 'hashedPassword',
  companyId: mockCompany.id,
  company: mockCompany,
  roleId: mockRole.id,
  role: mockRole,
  statusId: mockUserStatus.id,
  status: mockUserStatus,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  version: 1,
  mustChangePasswordAtNextLogin: false,
  isAnonymized: false,
  activeSessions: [],
};

export const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-123',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: { ...mockRole, id: 'role-admin', name: 'Admin' },
};

export const mockManagerUser: User = {
  ...mockUser,
  id: 'manager-123',
  email: 'manager@example.com',
  firstName: 'Manager',
  lastName: 'User',
  role: { ...mockRole, id: 'role-manager', name: 'Manager' },
};
```

## Test Coverage & Reporting

### Coverage Configuration

```json
{
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/index.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.spec.{ts,tsx}"
  ],
  "coverageReporters": ["text", "lcov", "html", "json-summary"],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    },
    "./src/services/": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  }
}
```

### Test Scripts

Our `package.json` in `App.API` defines various scripts for running tests:

```json
// App.API/package.json (Simplified)
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "jest --config ./jest-e2e.json",
    "test:load": "k6 run tests/load/api-load.test.js",
    "test:security": "jest --testPathPattern=tests/security"
  }
}
```

To run all tests for the backend:

```bash
cd App.API && yarn test
```

For frontend tests, navigate to `App.Web` and run `yarn test`.

---

_This comprehensive testing strategy ensures code quality, reliability, and security across all layers of the NCY_8 platform._
