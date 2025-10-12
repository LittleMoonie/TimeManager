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

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
  verbose: true
};
```

### Service Layer Tests

```typescript
// tests/services/user.service.test.ts
import { UserService } from '@/services/user.service';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/utils/auth';

jest.mock('@/lib/prisma');
jest.mock('@/utils/auth');

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        role: 'EMPLOYEE' as const,
      };

      mockHashPassword.mockResolvedValue('hashedPassword');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-123',
        email: userData.email,
        passwordHash: 'hashedPassword',
        name: userData.name,
        role: userData.role,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(mockHashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          passwordHash: 'hashedPassword',
          name: userData.name,
          role: userData.role,
          status: 'ACTIVE',
        },
      });
      expect(result.email).toBe(userData.email);
      expect(result.passwordHash).toBe('hashedPassword');
    });

    it('should throw error for duplicate email', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        role: 'EMPLOYEE' as const,
      };

      mockPrisma.user.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should validate email format', async () => {
      // Arrange
      const userData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        name: 'Test User',
        role: 'EMPLOYEE' as const,
      };

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(
        'Invalid email format'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'EMPLOYEE' as const,
        status: 'ACTIVE' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 'non-existent';
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toBeNull();
    });
  });
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
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
      ];

      validEmails.forEach(email => {
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

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    it('should return true for strong passwords', () => {
      const strongPasswords = [
        'SecurePass123!',
        'MyP@ssw0rd2024',
        'Complex#Password1',
      ];

      strongPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(true);
      });
    });

    it('should return false for weak passwords', () => {
      const weakPasswords = [
        'password',
        '12345678',
        'Password',
        'P@ssw0rd',
        'SecurePass123',
      ];

      weakPasswords.forEach(password => {
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

```typescript
// tests/integration/api/users.test.ts
import request from 'supertest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';
import { generateTestToken } from '@/tests/utils/auth';

describe('Users API', () => {
  let adminToken: string;
  let employeeToken: string;

  beforeAll(async () => {
    adminToken = await generateTestToken('ADMIN');
    employeeToken = await generateTestToken('EMPLOYEE');
  });

  beforeEach(async () => {
    // Clean up database
    await prisma.user.deleteMany();
    await prisma.Company.deleteMany();
  });

  describe('GET /api/v1/users', () => {
    it('should return users for admin', async () => {
      // Arrange
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashedPassword',
          name: 'Test User',
          role: 'EMPLOYEE',
        },
      });

      // Act
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].email).toBe(testUser.email);
      expect(response.body.data[0].passwordHash).toBeUndefined();
    });

    it('should return 403 for non-admin users', async () => {
      await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${employeeToken}`)
        .expect(403);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/v1/users')
        .expect(401);
    });

    it('should support pagination', async () => {
      // Arrange - create multiple users
      for (let i = 0; i < 25; i++) {
        await prisma.user.create({
          data: {
            email: `user${i}@example.com`,
            passwordHash: 'hashedPassword',
            name: `User ${i}`,
            role: 'EMPLOYEE',
          },
        });
      }

      // Act
      const response = await request(app)
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.total).toBe(25);
    });
  });

  describe('POST /api/v1/users', () => {
    it('should create user with valid data', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
        role: 'EMPLOYEE',
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.passwordHash).toBeUndefined();

      // Verify user was created in database
      const createdUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.name).toBe(userData.name);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak',
        name: '',
        role: 'INVALID',
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: expect.stringContaining('Invalid email format'),
        })
      );
    });

    it('should return 409 for duplicate email', async () => {
      // Arrange
      await prisma.user.create({
        data: {
          email: 'existing@example.com',
          passwordHash: 'hashedPassword',
          name: 'Existing User',
          role: 'EMPLOYEE',
        },
      });

      const userData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        name: 'New User',
        role: 'EMPLOYEE',
      };

      // Act & Assert
      await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(409);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update user with valid data', async () => {
      // Arrange
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashedPassword',
          name: 'Test User',
          role: 'EMPLOYEE',
        },
      });

      const updateData = {
        name: 'Updated Name',
        role: 'MANAGER',
      };

      // Act
      const response = await request(app)
        .put(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.role).toBe(updateData.role);

      // Verify database was updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser?.name).toBe(updateData.name);
      expect(updatedUser?.role).toBe(updateData.role);
    });

    it('should return 404 for non-existent user', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      await request(app)
        .put('/api/v1/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should soft delete user', async () => {
      // Arrange
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashedPassword',
          name: 'Test User',
          role: 'EMPLOYEE',
        },
      });

      // Act
      await request(app)
        .delete(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Assert - user should be soft deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(deletedUser?.deletedAt).toBeTruthy();

      // User should not appear in regular queries
      const users = await prisma.user.findMany();
      expect(users).toHaveLength(0);
    });
  });
});
```

### Database Integration Tests

```typescript
// tests/integration/database/user.repository.test.ts
import { UserRepository } from '@/repositories/user.repository';
import { prisma } from '@/lib/prisma';
import { createTestDatabase, cleanupTestDatabase } from '@/tests/utils/database';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let testDb: any;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    userRepository = new UserRepository();
  });

  afterAll(async () => {
    await cleanupTestDatabase(testDb);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      // Arrange
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashedPassword',
          name: 'Test User',
          role: 'EMPLOYEE',
        },
      });

      // Act
      const result = await userRepository.findByEmail('test@example.com');

      // Assert
      expect(result).toBeTruthy();
      expect(result?.email).toBe(user.email);
    });

    it('should return null for non-existent email', async () => {
      const result = await userRepository.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findActiveUsers', () => {
    it('should return only active users', async () => {
      // Arrange
      await prisma.user.createMany({
        data: [
          {
            email: 'active1@example.com',
            passwordHash: 'hashedPassword',
            name: 'Active User 1',
            role: 'EMPLOYEE',
            status: 'ACTIVE',
          },
          {
            email: 'active2@example.com',
            passwordHash: 'hashedPassword',
            name: 'Active User 2',
            role: 'EMPLOYEE',
            status: 'ACTIVE',
          },
          {
            email: 'inactive@example.com',
            passwordHash: 'hashedPassword',
            name: 'Inactive User',
            role: 'EMPLOYEE',
            status: 'INACTIVE',
          },
        ],
      });

      // Act
      const result = await userRepository.findActiveUsers();

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(user => user.status === 'ACTIVE')).toBe(true);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      // Arrange
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashedPassword',
          name: 'Test User',
          role: 'EMPLOYEE',
        },
      });

      const loginTime = new Date();

      // Act
      await userRepository.updateLastLogin(user.id, loginTime);

      // Assert
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser?.lastLoginAt).toEqual(loginTime);
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
      command: 'pnpm dev',
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm dev:api',
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
      'Invalid credentials'
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
      'User created successfully'
    );

    // User should appear in the list
    await expect(page.locator('[data-testid="user-list"]')).toContainText(
      'New Test User'
    );
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
    await expect(page.locator('[data-testid="user-list"]')).toContainText(
      'Updated User Name'
    );
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
      'User deleted successfully'
    );
  });

  test('should filter users by role', async ({ page }) => {
    await page.click('[data-testid="users-menu"]');
    
    // Filter by manager role
    await page.selectOption('[data-testid="role-filter"]', 'MANAGER');
    
    // All visible users should have manager role
    const userRoles = await page.locator('[data-testid="user-role"]').allTextContents();
    userRoles.forEach(role => {
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
    await expect(page.locator('[data-testid="project-list"]')).toContainText(
      'New Test Project'
    );
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
    await expect(page.locator('[data-testid="task-status"]:first')).toContainText(
      'IN_PROGRESS'
    );
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
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
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
    registerParams
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
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    // Get user profile
    const profileResponse = http.get(
      `${BASE_URL}/api/v1/users/me`,
      authParams
    );

    check(profileResponse, {
      'profile status is 200': (r) => r.status === 200,
      'profile response time < 300ms': (r) => r.timings.duration < 300,
    }) || errorRate.add(1);

    // Get projects
    const projectsResponse = http.get(
      `${BASE_URL}/api/v1/projects`,
      authParams
    );

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
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
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

    const createUserResponse = http.post(
      `${BASE_URL}/api/v1/users`,
      createUserPayload,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    check(createUserResponse, {
      'create user status is 201': (r) => r.status === 201,
      'create user response time < 800ms': (r) => r.timings.duration < 800,
    }) || errorRate.add(1);
  });

  group('Project Management API', () => {
    // Get projects
    const projectsResponse = http.get(`${BASE_URL}/api/v1/projects`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
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

    const createProjectResponse = http.post(
      `${BASE_URL}/api/v1/projects`,
      createProjectPayload,
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

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
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send(loginData)
          .expect(401);
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
      const weakPasswords = [
        'password',
        '12345678',
        'Password',
        'P@ssw0rd',
      ];

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

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      // Verify password is hashed in database
      const user = await prisma.user.findUnique({
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
      const malformedTokens = [
        'invalid-token',
        'Bearer invalid',
        'Bearer ',
        '',
      ];

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

## Test Utilities

### Test Helpers

```typescript
// tests/utils/test-helpers.ts
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const createTestDatabase = async () => {
  const testDb = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL,
      },
    },
  });

  await testDb.$connect();
  return testDb;
};

export const cleanupTestDatabase = async (db: PrismaClient) => {
  // Delete all data in reverse order of dependencies
  await db.auditLog.deleteMany();
  await db.task.deleteMany();
  await db.project.deleteMany();
  await db.CompanyMember.deleteMany();
  await db.Company.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
  
  await db.$disconnect();
};

export const generateTestToken = async (role: string = 'EMPLOYEE') => {
  return jwt.sign(
    {
      userId: 'test-user-id',
      email: 'test@example.com',
      role,
      CompanyId: 'test-org-id',
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
};

export const generateExpiredToken = () => {
  return jwt.sign(
    {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'EMPLOYEE',
    },
    process.env.JWT_SECRET!,
    { expiresIn: '-1h' } // Expired token
  );
};

export const createTestUser = async (overrides: any = {}) => {
  return prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash: 'hashedPassword',
      name: 'Test User',
      role: 'EMPLOYEE',
      ...overrides,
    },
  });
};

export const createTestCompany = async (overrides: any = {}) => {
  return prisma.Company.create({
    data: {
      name: 'Test Company',
      slug: 'test-org',
      ownerId: 'test-user-id',
      ...overrides,
    },
  });
};
```

### Mock Data

```typescript
// tests/mocks/user.ts
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'EMPLOYEE',
  status: 'ACTIVE',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  deletedAt: null,
};

export const mockAdminUser = {
  ...mockUser,
  id: 'admin-123',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'ADMIN',
};

export const mockManagerUser = {
  ...mockUser,
  id: 'manager-123',
  email: 'manager@example.com',
  name: 'Manager User',
  role: 'MANAGER',
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
  "coverageReporters": [
    "text",
    "lcov",
    "html",
    "json-summary"
  ],
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

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:load": "k6 run tests/load/api-load.test.js",
    "test:security": "jest --testPathPattern=tests/security",
    "test:all": "pnpm test:unit && pnpm test:integration && pnpm test:e2e"
  }
}
```

---

*This comprehensive testing strategy ensures code quality, reliability, and security across all layers of the NCY_8 platform.*
