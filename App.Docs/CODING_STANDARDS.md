# GoGoTime Coding Standards

> [!SUMMARY] **Development Guidelines**
> Comprehensive coding standards and best practices for GoGoTime development, covering TypeScript, React, Node.js, database design, and team collaboration standards.

## 📋 Table of Contents

- [[#🎯 Code Quality Standards|Code Quality Standards]]
- [[#⚛️ Frontend Guidelines|Frontend Guidelines]]
- [[#🔧 Backend Guidelines|Backend Guidelines]]
- [[#🗄️ Database Standards|Database Standards]]
- [[#🔧 Tooling & Automation|Tooling & Automation]]
- [[#👥 Team Collaboration|Team Collaboration]]

---

## 🎯 Code Quality Standards

### 📏 General Principles

> [!NOTE] **Core Development Values**
> - **Type Safety First**: Leverage TypeScript's type system for robust code
> - **Readability Over Cleverness**: Write code that others can easily understand
> - **Consistency**: Follow established patterns and conventions
> - **Performance Awareness**: Consider performance implications of code decisions
> - **Security by Design**: Build security considerations into all code

### 🏗️ Project Structure Standards

```
App.Web/                          # Frontend Application
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── common/              # Generic components (Button, Modal, etc.)
│   │   ├── layout/              # Layout components (Header, Sidebar)
│   │   └── guards/              # Route protection components
│   ├── features/                # Feature-based modules
│   │   ├── auth/                # Authentication feature
│   │   │   ├── components/      # Feature-specific components
│   │   │   ├── hooks/           # Feature-specific hooks
│   │   │   ├── services/        # Feature API calls
│   │   │   ├── types/           # Feature TypeScript types
│   │   │   └── utils/           # Feature utilities
│   │   └── dashboard/           # Dashboard feature
│   ├── hooks/                   # Global custom hooks
│   ├── lib/                     # Core application logic
│   │   ├── store/               # Redux store configuration
│   │   ├── routes/              # React Router setup
│   │   └── api/                 # API client configuration
│   ├── styles/                  # Global styles and themes
│   ├── types/                   # Global TypeScript definitions
│   └── utils/                   # Global utility functions
└── tests/                       # Test files mirror src structure

App.API/                          # Backend Application
├── src/
│   ├── routes/                  # Express route handlers
│   │   ├── auth/                # Authentication routes
│   │   ├── users/               # User management routes
│   │   └── projects/            # Project routes
│   ├── services/                # Business logic services
│   ├── models/                  # TypeORM entities
│   ├── middleware/              # Custom middleware
│   ├── config/                  # Configuration files
│   ├── utils/                   # Utility functions
│   └── types/                   # TypeScript type definitions
└── tests/                       # Test files
```

### 📝 Naming Conventions

```typescript
// ✅ Good Examples

// Variables and functions: camelCase
const userName = 'john_doe'
const fetchUserData = async () => {}

// Constants: SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.gogotime.com'
const MAX_RETRY_ATTEMPTS = 3

// Types and Interfaces: PascalCase
interface UserProfile {
  id: string
  username: string
}

type ApiResponse<T> = {
  success: boolean
  data: T
}

// Classes: PascalCase
class UserService {
  private apiClient: ApiClient
}

// Components: PascalCase
function UserProfileCard({ user }: { user: UserProfile }) {
  return <div>{user.username}</div>
}

// Files and directories: kebab-case
// user-profile-card.tsx
// api-client.ts
// auth-service.ts

// Database: snake_case
// user_profiles table
// created_at column
// user_id foreign key

// ❌ Bad Examples
const user_name = 'john' // Should be camelCase
const FETCHUSERDATA = () => {} // Should be camelCase
interface userProfile {} // Should be PascalCase
class userService {} // Should be PascalCase
// UserProfileCard.tsx // Should be kebab-case
```

---

## ⚛️ Frontend Guidelines

### 🎨 React Component Standards

**Component Structure:**
```typescript
// App.Web/src/components/common/Button.tsx
import React, { forwardRef } from 'react'
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material'
import { styled } from '@mui/material/styles'

// 1. Type definitions at the top
interface CustomButtonProps extends Omit<MuiButtonProps, 'color'> {
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
  icon?: React.ReactNode
}

// 2. Styled components
const StyledButton = styled(MuiButton)<{ $loading?: boolean }>(({ theme, $loading }) => ({
  position: 'relative',
  minWidth: theme.spacing(12),
  opacity: $loading ? 0.7 : 1,
  pointerEvents: $loading ? 'none' : 'auto',
  
  '&.primary': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    }
  },
  
  '&.danger': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    }
  }
}))

// 3. Component implementation
export const Button = forwardRef<HTMLButtonElement, CustomButtonProps>(({
  variant = 'primary',
  loading = false,
  icon,
  children,
  disabled,
  ...props
}, ref) => {
  return (
    <StyledButton
      ref={ref}
      className={variant}
      disabled={disabled || loading}
      $loading={loading}
      startIcon={!loading && icon}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </StyledButton>
  )
})

// 4. Display name for debugging
Button.displayName = 'Button'

// 5. Default export
export default Button
```

**Custom Hooks Pattern:**
```typescript
// App.Web/src/hooks/useApi.ts
import { useState, useEffect, useCallback } from 'react'

interface UseApiOptions<T> {
  initialData?: T
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  mutate: (newData: T) => void
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const { initialData = null, immediate = true, onSuccess, onError } = options
  
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall()
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [apiCall, onSuccess, onError])

  const mutate = useCallback((newData: T) => {
    setData(newData)
  }, [])

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [fetchData, immediate])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate
  }
}

// Usage example:
function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error, refetch } = useApi(
    () => userService.getUser(userId),
    {
      onError: (error) => toast.error(error.message),
      onSuccess: (user) => console.log('User loaded:', user.username)
    }
  )

  if (loading) return <Skeleton />
  if (error) return <ErrorMessage error={error} onRetry={refetch} />
  if (!user) return <NotFound />

  return <UserCard user={user} />
}
```

### 🎯 State Management with Redux Toolkit

**Slice Definition:**
```typescript
// App.Web/src/lib/store/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authService } from '@/services/authService'

// 1. Type definitions
interface User {
  id: string
  username: string
  email: string
  roles: string[]
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

// 2. Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
}

// 3. Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser()
      return response.data
    } catch (error) {
      return rejectWithValue('Failed to fetch user')
    }
  }
)

// 4. Slice definition
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      // Clear tokens
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        // Store tokens
        localStorage.setItem('accessToken', action.payload.accessToken)
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Fetch current user
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
      })
  }
})

export const { logout, clearError, updateUser } = authSlice.actions
export default authSlice.reducer

// 5. Selectors
export const selectAuth = (state: RootState) => state.auth
export const selectUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
```

### 📱 Responsive Design Standards

```typescript
// App.Web/src/styles/breakpoints.ts
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536
} as const

// Custom hook for responsive values
export function useResponsiveValue<T>(values: Partial<Record<keyof typeof breakpoints, T>>): T {
  const theme = useTheme()
  
  const xs = useMediaQuery(theme.breakpoints.only('xs'))
  const sm = useMediaQuery(theme.breakpoints.only('sm'))
  const md = useMediaQuery(theme.breakpoints.only('md'))
  const lg = useMediaQuery(theme.breakpoints.only('lg'))
  const xl = useMediaQuery(theme.breakpoints.up('xl'))

  if (xl && values.xl) return values.xl
  if (lg && values.lg) return values.lg
  if (md && values.md) return values.md
  if (sm && values.sm) return values.sm
  if (xs && values.xs) return values.xs
  
  // Fallback to largest available value
  return values.xl || values.lg || values.md || values.sm || values.xs!
}

// Usage example:
function ResponsiveComponent() {
  const columns = useResponsiveValue({
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4
  })

  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid key={item.id} item xs={12 / columns}>
          <ItemCard item={item} />
        </Grid>
      ))}
    </Grid>
  )
}
```

---

## 🔧 Backend Guidelines

### 🏗️ Express Route Structure

```typescript
// App.API/src/routes/users.ts
import express, { Router } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { userController } from '../controllers/userController'
import { authMiddleware } from '../middleware/auth'
import { rbacMiddleware } from '../middleware/rbac'
import { rateLimitMiddleware } from '../middleware/rateLimit'

const router: Router = express.Router()

// 1. Route-level middleware
router.use(authMiddleware) // All routes require authentication

// 2. Validation rules
const createUserValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
]

const updateUserValidation = [
  param('id').isUUID().withMessage('Valid user ID required'),
  body('username').optional().isLength({ min: 3, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
]

// 3. Route definitions with proper middleware order
router.post(
  '/',
  rateLimitMiddleware({ max: 5, windowMs: 15 * 60 * 1000 }), // Rate limiting first
  rbacMiddleware.requirePermission('users:create'), // Authorization
  createUserValidation, // Validation
  userController.createUser // Controller
)

router.get(
  '/',
  rbacMiddleware.requirePermission('users:read'),
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().isLength({ max: 100 }).trim().escape(),
  ],
  userController.getUsers
)

router.get(
  '/:id',
  rbacMiddleware.requirePermission('users:read'),
  [param('id').isUUID()],
  userController.getUserById
)

router.put(
  '/:id',
  rbacMiddleware.requirePermission('users:update'),
  updateUserValidation,
  userController.updateUser
)

router.delete(
  '/:id',
  rbacMiddleware.requirePermission('users:delete'),
  [param('id').isUUID()],
  userController.deleteUser
)

export default router
```

### 🎯 Service Layer Pattern

```typescript
// App.API/src/services/UserService.ts
import { Repository } from 'typeorm'
import { AppDataSource } from '../config/database'
import { User } from '../models/User'
import { CreateUserDTO, UpdateUserDTO, UserFilters } from '../types/user'
import { PaginationOptions, PaginatedResult } from '../types/common'
import { AppError } from '../utils/AppError'
import { logger } from '../utils/logger'

export class UserService {
  private userRepository: Repository<User>

  constructor() {
    this.userRepository = AppDataSource.getRepository(User)
  }

  // Create user with validation and error handling
  async createUser(userData: CreateUserDTO): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email }
      })

      if (existingUser) {
        throw new AppError('User with this email already exists', 409)
      }

      // Create and save user
      const user = this.userRepository.create(userData)
      const savedUser = await this.userRepository.save(user)

      // Log user creation
      logger.info('User created successfully', {
        userId: savedUser.id,
        email: savedUser.email,
        action: 'USER_CREATED'
      })

      return savedUser
    } catch (error) {
      logger.error('Failed to create user', {
        email: userData.email,
        error: error.message
      })
      throw error
    }
  }

  // Get users with filtering and pagination
  async getUsers(
    filters: UserFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<User>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = pagination

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.createdAt',
        'user.updatedAt'
      ]) // Exclude sensitive fields like password

    // Apply filters
    if (filters.search) {
      queryBuilder.andWhere(
        '(user.username ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.search}%` }
      )
    }

    if (filters.status) {
      queryBuilder.andWhere('user.status = :status', { status: filters.status })
    }

    if (filters.createdAfter) {
      queryBuilder.andWhere('user.createdAt >= :createdAfter', {
        createdAfter: filters.createdAfter
      })
    }

    // Apply sorting
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder)

    // Apply pagination
    const offset = (page - 1) * limit
    queryBuilder.skip(offset).take(limit)

    // Execute query
    const [users, total] = await queryBuilder.getManyAndCount()

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Update user with optimistic locking
  async updateUser(id: string, updateData: UpdateUserDTO): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Merge update data
    Object.assign(user, updateData)
    user.updatedAt = new Date()

    try {
      const updatedUser = await this.userRepository.save(user)
      
      logger.info('User updated successfully', {
        userId: updatedUser.id,
        updatedFields: Object.keys(updateData),
        action: 'USER_UPDATED'
      })

      return updatedUser
    } catch (error) {
      logger.error('Failed to update user', {
        userId: id,
        error: error.message
      })
      throw new AppError('Failed to update user', 500)
    }
  }

  // Soft delete user
  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Soft delete
    user.deletedAt = new Date()
    await this.userRepository.save(user)

    logger.info('User deleted successfully', {
      userId: id,
      action: 'USER_DELETED'
    })
  }

  // Get user by ID with error handling
  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'username',
        'email',
        'createdAt',
        'updatedAt'
      ]
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return user
  }

  // Bulk operations
  async bulkUpdateUsers(updates: Array<{ id: string; data: UpdateUserDTO }>): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      for (const update of updates) {
        await queryRunner.manager.update(User, update.id, {
          ...update.data,
          updatedAt: new Date()
        })
      }

      await queryRunner.commitTransaction()
      
      logger.info('Bulk user update completed', {
        updatedCount: updates.length,
        action: 'BULK_USER_UPDATE'
      })
    } catch (error) {
      await queryRunner.rollbackTransaction()
      logger.error('Bulk user update failed', {
        error: error.message,
        affectedIds: updates.map(u => u.id)
      })
      throw new AppError('Bulk update failed', 500)
    } finally {
      await queryRunner.release()
    }
  }
}

export const userService = new UserService()
```

### 🔒 Error Handling Standards

```typescript
// App.API/src/utils/AppError.ts
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly errorCode?: string

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode?: string,
    isOperational: boolean = true
  ) {
    super(message)
    
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.errorCode = errorCode
    
    Error.captureStackTrace(this, this.constructor)
  }
}

// App.API/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'
import { logger } from '../utils/logger'

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500
  let message = 'Internal server error'
  let errorCode: string | undefined

  if (error instanceof AppError) {
    statusCode = error.statusCode
    message = error.message
    errorCode = error.errorCode
  }

  // Log error
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    statusCode,
    errorCode,
    userId: req.user?.id,
    requestId: req.id
  })

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error'
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack
    })
  })
}
```

---

## 🗄️ Database Standards

### 🏗️ TypeORM Entity Patterns

```typescript
// App.API/src/models/BaseEntity.ts
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm'
import { v4 as uuidv4 } from 'uuid'

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date

  // Soft delete methods
  softDelete(): void {
    this.deletedAt = new Date()
  }

  restore(): void {
    this.deletedAt = undefined
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined
  }

  @BeforeInsert()
  protected generateId(): void {
    if (!this.id) {
      this.id = uuidv4()
    }
  }

  @BeforeUpdate()
  protected updateTimestamp(): void {
    this.updatedAt = new Date()
  }
}

// App.API/src/models/User.ts
import { Entity, Column, Index, OneToMany } from 'typeorm'
import { BaseEntity } from './BaseEntity'
import { TimeEntry } from './TimeEntry'

@Entity('users')
@Index(['email']) // Single column index
@Index(['status', 'createdAt']) // Composite index
export class User extends BaseEntity {
  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: false,
    comment: 'Unique username for login'
  })
  @Index() // Add index for frequent lookups
  username!: string

  @Column({ 
    type: 'varchar', 
    length: 255, 
    unique: true, 
    nullable: false,
    comment: 'User email address'
  })
  email!: string

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: false, 
    select: false, // Exclude from default selects
    comment: 'Hashed password'
  })
  password!: string

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification',
    comment: 'User account status'
  })
  status!: 'active' | 'inactive' | 'suspended' | 'pending_verification'

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName?: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName?: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarUrl?: string

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date

  @Column({ 
    type: 'jsonb', 
    nullable: true,
    comment: 'User preferences and settings'
  })
  preferences?: Record<string, any>

  // Relationships
  @OneToMany(() => TimeEntry, timeEntry => timeEntry.user)
  timeEntries!: TimeEntry[]

  // Virtual properties
  get fullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`
    }
    return this.username
  }

  get isActive(): boolean {
    return this.status === 'active' && !this.isDeleted
  }

  // Helper methods
  updateLastLogin(): void {
    this.lastLoginAt = new Date()
  }

  verifyEmail(): void {
    this.emailVerified = true
    this.status = 'active'
  }
}
```

### 📊 Migration Standards

```typescript
// App.API/src/migrations/1234567890123-CreateUsersTable.ts
import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm'

export class CreateUsersTable1234567890123 implements MigrationInterface {
  name = 'CreateUsersTable1234567890123'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()'
          },
          {
            name: 'username',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Unique username for login'
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
            comment: 'User email address'
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Hashed password'
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'suspended', 'pending_verification'],
            default: "'pending_verification'",
            comment: 'User account status'
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'avatar_url',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'email_verified',
            type: 'boolean',
            default: false
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'preferences',
            type: 'jsonb',
            isNullable: true,
            comment: 'User preferences and settings'
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true
          }
        ]
      }),
      true
    )

    // Create indexes
    await queryRunner.createIndex('users', new Index({
      name: 'IDX_USERS_USERNAME',
      columnNames: ['username']
    }))

    await queryRunner.createIndex('users', new Index({
      name: 'IDX_USERS_EMAIL',
      columnNames: ['email']
    }))

    await queryRunner.createIndex('users', new Index({
      name: 'IDX_USERS_STATUS_CREATED',
      columnNames: ['status', 'created_at']
    }))

    // Add comment to table
    await queryRunner.query(`
      COMMENT ON TABLE users IS 'User accounts and authentication data'
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users')
  }
}
```

---

## 🔧 Tooling & Automation

### 📏 ESLint Configuration

```json
// .eslintrc.json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "import",
    "jsx-a11y"
  ],
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    // TypeScript specific rules
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    
    // Import rules
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ],
    
    // React specific rules
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/display-name": "error",
    "react/jsx-curly-brace-presence": ["error", "never"],
    "react/jsx-boolean-value": ["error", "never"],
    
    // General rules
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-template": "error"
  },
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/resolver": {
      "typescript": {}
    }
  }
}
```

### 🎨 Prettier Configuration

```json
// .prettierrc
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "proseWrap": "preserve"
}
```

### 🔨 Husky & lint-staged

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

```bash
#!/bin/sh
# .husky/pre-commit
. "$(dirname "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged

# Run type checking
npm run typecheck

# Run tests on staged files
npm run test:staged
```

---

## 👥 Team Collaboration

### 📝 Git Workflow Standards

**Branch Naming Convention:**
```bash
# Feature branches
feature/user-authentication
feature/time-tracking-dashboard
feature/project-management

# Bug fix branches  
fix/login-validation-error
fix/dashboard-rendering-issue

# Hotfix branches
hotfix/security-vulnerability
hotfix/critical-data-loss

# Release branches
release/v1.2.0
release/v1.2.1

# Chore branches
chore/update-dependencies
chore/improve-documentation
```

**Commit Message Format:**
```bash
# Format: <type>(<scope>): <description>
# 
# <body>
# 
# <footer>

# Examples:
feat(auth): add JWT token refresh mechanism

- Implement automatic token refresh
- Add refresh token rotation
- Update auth middleware to handle expired tokens

Closes #123

fix(dashboard): resolve widget loading performance issue

- Optimize widget data fetching
- Implement proper loading states
- Add error boundaries for failed widgets

Performance improvement reduces load time by 40%

docs(readme): update installation instructions

- Add Docker setup steps
- Update environment variable documentation
- Fix broken links

chore(deps): upgrade React to v19.2.0

- Update React and React DOM
- Update type definitions
- Fix breaking changes in components

BREAKING CHANGE: Component prop interfaces have changed
```

### 🔍 Code Review Guidelines

**Review Checklist:**
```markdown
## Code Review Checklist

### Functionality
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Performance is acceptable

### Code Quality
- [ ] Code is readable and well-documented
- [ ] Functions are small and focused
- [ ] No code duplication
- [ ] Proper naming conventions used

### Testing
- [ ] Tests are included for new functionality
- [ ] Tests are comprehensive and meaningful
- [ ] All tests pass
- [ ] Code coverage is maintained

### Security
- [ ] No sensitive data in code
- [ ] Input validation is proper
- [ ] Authorization checks are in place
- [ ] SQL injection prevention

### Architecture
- [ ] Follows established patterns
- [ ] Proper separation of concerns
- [ ] Dependencies are appropriate
- [ ] Database changes are documented
```

**Review Comments Standards:**
```typescript
// ✅ Good review comments:

// "Consider using useMemo here to prevent unnecessary recalculations"
const expensiveValue = useMemo(() => computeExpensiveValue(data), [data])

// "This function is doing too much. Consider splitting into smaller functions"
function processUserData(user) {
  // 50+ lines of code
}

// "Add error handling for the API call"
const userData = await fetchUser(userId)

// ❌ Poor review comments:
// "This is wrong"
// "Change this"  
// "I don't like this"

// ✅ Better alternatives:
// "This approach might cause memory leaks. Consider using useEffect cleanup"
// "This violates our naming convention. Use camelCase for variables"
// "This pattern doesn't match our established architecture. See UserService for reference"
```

### 📚 Documentation Standards

**Code Documentation:**
```typescript
/**
 * Calculates the user's productivity score based on time tracking data
 * 
 * @param userId - The unique identifier for the user
 * @param timeRange - The time period to analyze (in days)
 * @param options - Additional calculation options
 * @param options.includeWeekends - Whether to include weekend activity
 * @param options.weightFactors - Custom weights for different productivity factors
 * 
 * @returns Promise that resolves to productivity score (0-100)
 * 
 * @throws {AppError} When user is not found or data is insufficient
 * 
 * @example
 * ```typescript
 * const score = await calculateProductivityScore('user-123', 30, {
 *   includeWeekends: false,
 *   weightFactors: { consistency: 0.4, efficiency: 0.6 }
 * })
 * console.log(`Productivity score: ${score}%`)
 * ```
 */
async function calculateProductivityScore(
  userId: string,
  timeRange: number,
  options: ProductivityOptions = {}
): Promise<number> {
  // Implementation...
}
```

**README Template:**
```markdown
# Feature Name

Brief description of what this feature does.

## Overview

Detailed explanation of the feature's purpose and functionality.

## Usage

### Basic Usage
```typescript
// Code example showing basic usage
```

### Advanced Usage
```typescript
// Code example showing advanced features
```

## API Reference

### Methods

#### `methodName(param1, param2)`
- **Description**: What the method does
- **Parameters**: 
  - `param1` (type): Description
  - `param2` (type): Description  
- **Returns**: Description of return value
- **Throws**: Description of possible errors

## Testing

```bash
# How to run tests
npm test

# How to run specific tests
npm test -- --grep "feature name"
```

## Contributing

Guidelines for contributing to this feature.
```

---

## 🏷️ Tags

#coding-standards #typescript #react #nodejs #eslint #prettier #git-workflow #documentation

**Related Documentation:**
- [[DEVELOPMENT_SETUP]] - Development environment configuration
- [[COMPONENT_LIBRARY]] - React component standards
- [[API_REFERENCE]] - API development standards
- [[CONTRIBUTING]] - Contribution guidelines

---

> [!NOTE] **Document Maintenance**
> **Last Updated:** {date}  
> **Version:** 1.0.0  
> **Maintainers:** Development Team (Lazaro, Alexy, Massi, Lounis)

> [!TIP] **Coding Best Practices**
> - Always prioritize code readability and maintainability
> - Write tests before implementing features (TDD)
> - Use TypeScript's type system to catch errors early
> - Follow the principle of least surprise in API design
> - Document complex business logic and architectural decisions
> - Regularly refactor code to improve quality and performance
