# GoGoTime Performance Optimization

> [!SUMMARY] **High-Performance Application**
> Comprehensive performance optimization guide covering frontend rendering, backend efficiency, database tuning, and infrastructure scaling for optimal GoGoTime performance.

## 📋 Table of Contents

- [[#📊 Performance Overview|Performance Overview]]
- [[#⚛️ Frontend Optimization|Frontend Optimization]]
- [[#🔧 Backend Optimization|Backend Optimization]]
- [[#🗄️ Database Performance|Database Performance]]
- [[#🌐 Network & Caching|Network & Caching]]
- [[#📈 Monitoring & Profiling|Monitoring & Profiling]]

---

## 📊 Performance Overview

### 🎯 Performance Targets

```mermaid
graph TB
    subgraph "Performance Metrics"
        subgraph "Frontend Metrics"
            FCP[🎨 First Contentful Paint<br/>< 1.8s]
            LCP[🖼️ Largest Contentful Paint<br/>< 2.5s]
            CLS[📐 Cumulative Layout Shift<br/>< 0.1]
            FID[⚡ First Input Delay<br/>< 100ms]
        end
        
        subgraph "Backend Metrics"
            API[📡 API Response Time<br/>< 200ms (p95)]
            DB[🗄️ Database Query Time<br/>< 50ms (p95)]
            MEM[💾 Memory Usage<br/>< 512MB]
            CPU[🖥️ CPU Usage<br/>< 70%]
        end
        
        subgraph "Network Metrics"
            TTL[⏱️ Time to Load<br/>< 3s]
            CACHE[💾 Cache Hit Rate<br/>> 85%]
            CDN[🌐 CDN Performance<br/>< 50ms]
        end
    end
    
    FCP --> API
    LCP --> DB
    CLS --> TTL
    FID --> CACHE
```

### 📈 Performance Benchmarks

| Metric | Target | Good | Needs Improvement |
|--------|--------|------|------------------|
| **First Contentful Paint** | < 1.8s | < 2.5s | > 2.5s |
| **Largest Contentful Paint** | < 2.5s | < 4.0s | > 4.0s |
| **First Input Delay** | < 100ms | < 300ms | > 300ms |
| **Cumulative Layout Shift** | < 0.1 | < 0.25 | > 0.25 |
| **API Response (p95)** | < 200ms | < 500ms | > 500ms |
| **Database Query (p95)** | < 50ms | < 100ms | > 100ms |

---

## ⚛️ Frontend Optimization

### 🚀 React Performance

**Component Optimization:**
```typescript
// App.Web/src/components/optimized/UserList.tsx
import { memo, useMemo, useCallback, useState } from 'react'
import { VirtualList } from '@/components/common/VirtualList'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface UserListProps {
  users: User[]
  onUserSelect: (user: User) => void
  searchTerm: string
}

// Memoized component to prevent unnecessary re-renders
export const UserList = memo(({ users, onUserSelect, searchTerm }: UserListProps) => {
  // Memoize expensive computations
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users
    
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])

  // Memoize callback to prevent child re-renders
  const handleUserClick = useCallback((user: User) => {
    onUserSelect(user)
  }, [onUserSelect])

  // Virtualized rendering for large lists
  const renderUser = useCallback(({ index, style }) => {
    const user = filteredUsers[index]
    return (
      <div style={style} key={user.id}>
        <UserCard 
          user={user} 
          onClick={handleUserClick}
        />
      </div>
    )
  }, [filteredUsers, handleUserClick])

  return (
    <VirtualList
      height={600}
      itemCount={filteredUsers.length}
      itemSize={80}
      renderItem={renderUser}
    />
  )
})

// Memoized user card component
const UserCard = memo(({ user, onClick }: { user: User; onClick: (user: User) => void }) => {
  const handleClick = useCallback(() => {
    onClick(user)
  }, [user, onClick])

  return (
    <Card onClick={handleClick} sx={{ cursor: 'pointer', mb: 1 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
        <Avatar 
          src={user.avatar} 
          loading="lazy"
          sx={{ mr: 2 }}
        >
          {user.name.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h6">{user.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
})
```

**Custom Hooks for Performance:**
```typescript
// App.Web/src/hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Usage in search component
export function SearchInput({ onSearch }: { onSearch: (term: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    onSearch(debouncedSearchTerm)
  }, [debouncedSearchTerm, onSearch])

  return (
    <TextField
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search users..."
    />
  )
}
```

### 🎨 Bundle Optimization

**Vite Configuration for Performance:**
```typescript
// App.Web/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { analyzer } from 'vite-bundle-analyzer'

export default defineConfig({
  plugins: [
    react(),
    // Bundle analysis in development
    process.env.ANALYZE && analyzer()
  ],
  
  build: {
    // Enable source maps for better debugging
    sourcemap: true,
    
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          routing: ['react-router-dom'],
          
          // Feature chunks
          dashboard: ['./src/features/dashboard'],
          auth: ['./src/features/auth'],
          utilities: ['./src/features/utilities']
        },
        
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            return `${chunkInfo.name}-[hash].js`
          }
          return `chunk-[hash].js`
        }
      }
    },
    
    // Minimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true
      }
    }
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material'],
    exclude: ['@vite/client', '@vite/env']
  }
})
```

**Code Splitting with React Router:**
```typescript
// App.Web/src/lib/routes/MainRoutes.tsx
import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Loadable } from '@/components/common/Loadable'

// Lazy load components for code splitting
const DashboardDefault = Loadable(
  lazy(() => import('@/features/dashboard/DashboardDefault'))
)

const UtilsTypography = Loadable(
  lazy(() => import('@/features/utilities/Typography'))
)

const UserManagement = Loadable(
  lazy(() => import('@/features/admin/UserManagement'))
)

// Preload critical routes
const preloadDashboard = () => import('@/features/dashboard/DashboardDefault')

function MainRoutes() {
  // Preload dashboard on route hover
  const handleDashboardHover = () => {
    preloadDashboard()
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route 
          path="dashboard" 
          element={<DashboardDefault />}
          onMouseEnter={handleDashboardHover}
        />
        <Route path="utils/typography" element={<UtilsTypography />} />
        <Route path="admin/users" element={<UserManagement />} />
      </Route>
    </Routes>
  )
}
```

### 🖼️ Image Optimization

```typescript
// App.Web/src/components/common/OptimizedImage.tsx
import { useState, useCallback } from 'react'
import { Box, Skeleton } from '@mui/material'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  placeholder?: string
  loading?: 'lazy' | 'eager'
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  placeholder,
  loading = 'lazy'
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  // Generate responsive image URLs
  const generateSrcSet = (baseSrc: string) => {
    const sizes = [400, 800, 1200, 1600]
    return sizes.map(size => `${baseSrc}?w=${size} ${size}w`).join(', ')
  }

  if (hasError) {
    return (
      <Box
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.200',
          color: 'grey.500'
        }}
      >
        Failed to load image
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'relative', width, height }}>
      {isLoading && (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          sx={{ position: 'absolute', top: 0, left: 0 }}
        />
      )}
      
      <img
        src={src}
        srcSet={generateSrcSet(src)}
        sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
    </Box>
  )
}
```

---

## 🔧 Backend Optimization

### ⚡ API Performance

**Request Optimization:**
```typescript
// App.API/src/middleware/performance.ts
import compression from 'compression'
import helmet from 'helmet'
import { Request, Response, NextFunction } from 'express'

// Compression middleware
export const compressionMiddleware = compression({
  level: 6, // Compression level (1-9)
  threshold: 1024, // Only compress if response > 1KB
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  }
})

// Response time tracking
export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime()
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start)
    const milliseconds = seconds * 1000 + nanoseconds / 1000000
    
    // Log slow requests
    if (milliseconds > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} - ${milliseconds}ms`)
    }
    
    // Track metrics
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(milliseconds / 1000)
  })
  
  next()
}

// Memory usage monitoring
export const memoryMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const usage = process.memoryUsage()
  
  if (usage.heapUsed > 512 * 1024 * 1024) { // 512MB
    console.warn('High memory usage detected:', {
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`
    })
  }
  
  next()
}
```

**Efficient Data Serialization:**
```typescript
// App.API/src/utils/serialization.ts
interface SerializationOptions {
  excludeFields?: string[]
  includeFields?: string[]
  transformFields?: Record<string, (value: any) => any>
}

export class DataSerializer {
  static serialize<T>(data: T | T[], options: SerializationOptions = {}): any {
    const { excludeFields = [], includeFields, transformFields = {} } = options
    
    const serializeObject = (obj: any): any => {
      if (obj === null || typeof obj !== 'object') {
        return obj
      }
      
      if (Array.isArray(obj)) {
        return obj.map(serializeObject)
      }
      
      const result: any = {}
      
      for (const [key, value] of Object.entries(obj)) {
        // Skip excluded fields
        if (excludeFields.includes(key)) continue
        
        // Include only specified fields (if provided)
        if (includeFields && !includeFields.includes(key)) continue
        
        // Apply field transformations
        if (transformFields[key]) {
          result[key] = transformFields[key](value)
          continue
        }
        
        // Recursively serialize nested objects
        result[key] = serializeObject(value)
      }
      
      return result
    }
    
    return serializeObject(data)
  }
  
  // Serialize user data (remove sensitive fields)
  static serializeUser(user: any): any {
    return this.serialize(user, {
      excludeFields: ['password', 'refreshToken', 'internalNotes'],
      transformFields: {
        createdAt: (date: Date) => date.toISOString(),
        updatedAt: (date: Date) => date.toISOString()
      }
    })
  }
  
  // Serialize for public API (minimal data)
  static serializePublic(data: any): any {
    return this.serialize(data, {
      includeFields: ['id', 'name', 'email', 'createdAt'],
      transformFields: {
        email: (email: string) => email.replace(/(.{2}).*@/, '$1***@') // Obfuscate email
      }
    })
  }
}
```

### 🔄 Async Processing

**Background Job Processing:**
```typescript
// App.API/src/jobs/queue.ts
import Queue from 'bull'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// Create job queues
export const emailQueue = new Queue('email processing', { redis })
export const reportQueue = new Queue('report generation', { redis })
export const cleanupQueue = new Queue('data cleanup', { redis })

// Email processing job
emailQueue.process('send-email', async (job) => {
  const { to, subject, template, data } = job.data
  
  try {
    await sendEmail({ to, subject, template, data })
    console.log(`Email sent to ${to}`)
  } catch (error) {
    console.error('Email sending failed:', error)
    throw error
  }
})

// Report generation job
reportQueue.process('generate-report', 5, async (job) => { // Process 5 jobs concurrently
  const { userId, reportType, filters } = job.data
  
  const startTime = Date.now()
  
  try {
    // Update job progress
    await job.progress(10)
    
    const data = await fetchReportData(reportType, filters)
    await job.progress(50)
    
    const report = await generateReport(data, reportType)
    await job.progress(80)
    
    const fileUrl = await uploadReport(report, userId)
    await job.progress(100)
    
    console.log(`Report generated in ${Date.now() - startTime}ms`)
    return { fileUrl }
  } catch (error) {
    console.error('Report generation failed:', error)
    throw error
  }
})

// Cleanup job (runs daily)
cleanupQueue.add('cleanup-expired-sessions', {}, {
  repeat: { cron: '0 2 * * *' }, // Daily at 2 AM
  removeOnComplete: 5,
  removeOnFail: 10
})

cleanupQueue.process('cleanup-expired-sessions', async () => {
  const deletedCount = await sessionService.cleanupExpiredSessions()
  console.log(`Cleaned up ${deletedCount} expired sessions`)
})

// Job failure handling
emailQueue.on('failed', (job, err) => {
  console.error(`Email job ${job.id} failed:`, err)
  // Could implement retry logic or alerting here
})

reportQueue.on('completed', (job, result) => {
  console.log(`Report job ${job.id} completed:`, result)
  // Could send notification to user
})
```

---

## 🗄️ Database Performance

### 📊 Query Optimization

**Efficient TypeORM Queries:**
```typescript
// App.API/src/services/UserService.ts
import { Repository, SelectQueryBuilder } from 'typeorm'
import { AppDataSource } from '../server/database'
import { User } from '../models/User'

export class UserService {
  private userRepository: Repository<User>

  constructor() {
    this.userRepository = AppDataSource.getRepository(User)
  }

  // Optimized user listing with pagination and filtering
  async getUsers(options: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
  }) {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC' 
    } = options

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username', 
        'user.email',
        'user.createdAt',
        'user.updatedAt'
      ]) // Select only needed fields

    // Add search filter
    if (search) {
      queryBuilder.where(
        '(user.username ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      )
    }

    // Add sorting
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder)

    // Add pagination
    const offset = (page - 1) * limit
    queryBuilder.skip(offset).take(limit)

    // Execute query with count
    const [users, total] = await queryBuilder.getManyAndCount()

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Optimized user with related data
  async getUserWithSessions(userId: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.sessions', 'session', 'session.isActive = :isActive', { isActive: true })
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.createdAt',
        'session.id',
        'session.lastActivityAt',
        'session.deviceInfo'
      ])
      .where('user.id = :userId', { userId })
      .getOne()
  }

  // Bulk operations for performance
  async createUsers(userData: Partial<User>[]): Promise<User[]> {
    const users = this.userRepository.create(userData)
    
    // Use batch insert for better performance
    return await this.userRepository.save(users, { chunk: 100 })
  }

  async updateUsers(updates: { id: string; data: Partial<User> }[]): Promise<void> {
    // Use raw query for bulk updates
    const cases = updates.map(update => 
      `WHEN id = '${update.id}' THEN '${update.data.username}'`
    ).join(' ')
    
    const ids = updates.map(u => `'${u.id}'`).join(', ')
    
    await this.userRepository.query(`
      UPDATE users 
      SET username = CASE ${cases} END,
          "updatedAt" = NOW()
      WHERE id IN (${ids})
    `)
  }
}
```

**Database Indexing Strategy:**
```sql
-- App.API/src/migrations/AddPerformanceIndexes.sql

-- User table indexes
CREATE INDEX CONCURRENTLY idx_users_email_active 
ON users(email) WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_users_created_at_desc 
ON users(created_at DESC);

CREATE INDEX CONCURRENTLY idx_users_search 
ON users USING gin(to_tsvector('english', username || ' ' || email));

-- Session table indexes
CREATE INDEX CONCURRENTLY idx_sessions_user_active 
ON sessions(user_id, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_sessions_expires_at 
ON sessions(expires_at) WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_sessions_cleanup 
ON sessions(expires_at) WHERE expires_at < NOW();

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_users_status_created 
ON users(status, created_at DESC) WHERE status IN ('active', 'pending');

-- Partial indexes for better performance
CREATE INDEX CONCURRENTLY idx_sessions_recent_activity 
ON sessions(last_activity_at DESC) 
WHERE is_active = true AND last_activity_at > (NOW() - INTERVAL '7 days');
```

### 💾 Connection Pooling

```typescript
// App.API/src/config/database-pool.ts
import { DataSource } from 'typeorm'

export const createOptimizedDataSource = () => {
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    
    // Connection pooling configuration
    extra: {
      // Connection pool settings
      max: parseInt(process.env.DB_POOL_MAX || '20'), // Maximum connections
      min: parseInt(process.env.DB_POOL_MIN || '5'),  // Minimum connections
      
      // Connection timeouts
      acquireTimeoutMillis: 60000,   // 60 seconds to acquire connection
      createTimeoutMillis: 30000,    // 30 seconds to create connection
      destroyTimeoutMillis: 5000,    // 5 seconds to destroy connection
      idleTimeoutMillis: 600000,     // 10 minutes idle timeout
      reapIntervalMillis: 1000,      // Check for idle connections every second
      
      // Connection validation
      createRetryIntervalMillis: 200,
      
      // Performance settings
      statement_timeout: 30000,      // 30 second query timeout
      query_timeout: 30000,
      
      // Connection settings for performance
      application_name: 'gogotime-api',
      
      // SSL settings for production
      ...(process.env.NODE_ENV === 'production' && {
        ssl: {
          rejectUnauthorized: false
        }
      })
    },
    
    // Logging configuration
    logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    logger: 'advanced-console',
    
    // Connection options
    synchronize: false, // Never use in production
    migrationsRun: false, // Run migrations manually
    
    // Cache settings
    cache: {
      type: 'redis',
      options: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      },
      duration: 30000 // Cache for 30 seconds
    }
  })
}
```

---

## 🌐 Network & Caching

### ⚡ HTTP Caching

```typescript
// App.API/src/middleware/caching.ts
import { Request, Response, NextFunction } from 'express'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

interface CacheOptions {
  ttl: number // Time to live in seconds
  key?: (req: Request) => string
  skipCache?: (req: Request) => boolean
}

export const cacheMiddleware = (options: CacheOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for certain conditions
    if (options.skipCache?.(req) || req.method !== 'GET') {
      return next()
    }

    // Generate cache key
    const defaultKey = `cache:${req.originalUrl}`
    const cacheKey = options.key ? options.key(req) : defaultKey

    try {
      // Try to get cached response
      const cached = await redis.get(cacheKey)
      
      if (cached) {
        const data = JSON.parse(cached)
        
        // Set cache headers
        res.set({
          'Cache-Control': `public, max-age=${options.ttl}`,
          'X-Cache': 'HIT'
        })
        
        return res.json(data)
      }

      // Cache miss - continue to route handler
      res.set('X-Cache', 'MISS')
      
      // Override res.json to cache the response
      const originalJson = res.json
      res.json = function(data: any) {
        // Cache the response
        redis.setex(cacheKey, options.ttl, JSON.stringify(data))
        
        // Set cache headers
        res.set({
          'Cache-Control': `public, max-age=${options.ttl}`,
          'ETag': generateETag(data)
        })
        
        return originalJson.call(this, data)
      }

      next()
    } catch (error) {
      console.error('Cache middleware error:', error)
      next()
    }
  }
}

// ETags for conditional requests
const generateETag = (data: any): string => {
  const crypto = require('crypto')
  return crypto
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex')
}

// Usage examples
export const userListCache = cacheMiddleware({
  ttl: 300, // 5 minutes
  key: (req) => `users:list:${req.query.page || 1}:${req.query.search || 'all'}`,
  skipCache: (req) => req.headers['cache-control'] === 'no-cache'
})

export const staticDataCache = cacheMiddleware({
  ttl: 3600, // 1 hour
  key: (req) => `static:${req.path}`
})
```

### 🔄 Response Compression

```typescript
// App.API/src/middleware/compression.ts
import compression from 'compression'
import { Request, Response } from 'express'

export const compressionConfig = compression({
  // Compression level (1-9, higher = better compression but slower)
  level: 6,
  
  // Only compress responses larger than this threshold
  threshold: 1024, // 1KB
  
  // Memory level (1-9, higher = more memory usage but better compression)
  memLevel: 8,
  
  // Window bits (9-15, higher = better compression but more memory)
  windowBits: 15,
  
  // Compression strategy
  strategy: compression.constants.Z_DEFAULT_STRATEGY,
  
  // Filter function to determine which responses to compress
  filter: (req: Request, res: Response) => {
    // Skip compression if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false
    }

    // Skip compression for already compressed content
    const contentType = res.getHeader('Content-Type') as string
    if (contentType && (
      contentType.includes('image/') ||
      contentType.includes('video/') ||
      contentType.includes('application/zip') ||
      contentType.includes('application/gzip')
    )) {
      return false
    }

    // Use default filter for other content
    return compression.filter(req, res)
  }
})
```

---

## 📈 Monitoring & Profiling

### 🔍 Performance Monitoring

```typescript
// App.API/src/monitoring/performance.ts
import { Request, Response, NextFunction } from 'express'
import { performance } from 'perf_hooks'

interface PerformanceMetrics {
  requestCount: number
  averageResponseTime: number
  slowRequests: Array<{
    method: string
    path: string
    duration: number
    timestamp: Date
  }>
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    averageResponseTime: 0,
    slowRequests: []
  }

  private responseTimes: number[] = []
  private readonly slowRequestThreshold = 1000 // 1 second

  middleware = (req: Request, res: Response, next: NextFunction) => {
    const start = performance.now()
    
    res.on('finish', () => {
      const duration = performance.now() - start
      this.recordRequest(req, duration)
    })
    
    next()
  }

  private recordRequest(req: Request, duration: number) {
    this.metrics.requestCount++
    this.responseTimes.push(duration)
    
    // Keep only last 1000 response times for average calculation
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift()
    }
    
    // Update average response time
    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
    
    // Track slow requests
    if (duration > this.slowRequestThreshold) {
      this.metrics.slowRequests.push({
        method: req.method,
        path: req.path,
        duration,
        timestamp: new Date()
      })
      
      // Keep only last 100 slow requests
      if (this.metrics.slowRequests.length > 100) {
        this.metrics.slowRequests.shift()
      }
      
      console.warn(`Slow request detected: ${req.method} ${req.path} - ${duration}ms`)
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  getPercentiles() {
    const sorted = [...this.responseTimes].sort((a, b) => a - b)
    const len = sorted.length
    
    return {
      p50: sorted[Math.floor(len * 0.5)],
      p90: sorted[Math.floor(len * 0.9)],
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)]
    }
  }

  reset() {
    this.metrics = {
      requestCount: 0,
      averageResponseTime: 0,
      slowRequests: []
    }
    this.responseTimes = []
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Health check endpoint with performance metrics
export const performanceHealthCheck = (req: Request, res: Response) => {
  const metrics = performanceMonitor.getMetrics()
  const percentiles = performanceMonitor.getPercentiles()
  
  res.json({
    status: 'ok',
    performance: {
      ...metrics,
      percentiles,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      loadAverage: require('os').loadavg()
    }
  })
}
```

### 📊 Frontend Performance Tracking

```typescript
// App.Web/src/monitoring/performance-tracker.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

interface PerformanceEntry {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

class PerformanceTracker {
  private entries: PerformanceEntry[] = []
  private apiEndpoint = '/api/metrics/web-vitals'

  constructor() {
    this.initializeWebVitals()
    this.trackCustomMetrics()
  }

  private initializeWebVitals() {
    // Core Web Vitals
    getCLS(this.onVitalsMetric.bind(this))
    getFID(this.onVitalsMetric.bind(this))
    getFCP(this.onVitalsMetric.bind(this))
    getLCP(this.onVitalsMetric.bind(this))
    getTTFB(this.onVitalsMetric.bind(this))
  }

  private onVitalsMetric(metric: any) {
    const entry: PerformanceEntry = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now()
    }
    
    this.entries.push(entry)
    this.sendMetric(entry)
    
    // Log poor performance
    if (metric.rating === 'poor') {
      console.warn(`Poor ${metric.name} performance:`, metric.value)
    }
  }

  private trackCustomMetrics() {
    // Track route changes
    this.trackRoutePerformance()
    
    // Track component render times
    this.trackComponentPerformance()
    
    // Track API call performance
    this.trackAPIPerformance()
  }

  private trackRoutePerformance() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming
          
          this.recordMetric('route-load-time', navigationEntry.loadEventEnd - navigationEntry.fetchStart)
          this.recordMetric('dom-content-loaded', navigationEntry.domContentLoadedEventEnd - navigationEntry.fetchStart)
          this.recordMetric('first-paint', navigationEntry.responseEnd - navigationEntry.fetchStart)
        }
      })
    })
    
    observer.observe({ entryTypes: ['navigation'] })
  }

  private trackComponentPerformance() {
    // Track React component render times
    if ('React' in window) {
      const originalCreateElement = React.createElement
      
      React.createElement = function(type, props, ...children) {
        const start = performance.now()
        const element = originalCreateElement.apply(this, arguments)
        const end = performance.now()
        
        if (end - start > 16) { // > 16ms (60fps threshold)
          console.warn(`Slow component render: ${type.name || type} - ${end - start}ms`)
        }
        
        return element
      }
    }
  }

  private trackAPIPerformance() {
    // Override fetch to track API performance
    const originalFetch = window.fetch
    
    window.fetch = async (...args) => {
      const start = performance.now()
      
      try {
        const response = await originalFetch.apply(window, args)
        const end = performance.now()
        
        const url = typeof args[0] === 'string' ? args[0] : args[0].url
        this.recordMetric(`api-call-${this.getEndpointName(url)}`, end - start)
        
        return response
      } catch (error) {
        const end = performance.now()
        const url = typeof args[0] === 'string' ? args[0] : args[0].url
        this.recordMetric(`api-error-${this.getEndpointName(url)}`, end - start)
        throw error
      }
    }
  }

  private getEndpointName(url: string): string {
    try {
      const pathname = new URL(url, window.location.origin).pathname
      return pathname.replace(/\/api\//, '').replace(/\//g, '-')
    } catch {
      return 'unknown'
    }
  }

  private recordMetric(name: string, value: number) {
    const entry: PerformanceEntry = {
      name,
      value,
      rating: this.getRating(name, value),
      timestamp: Date.now()
    }
    
    this.entries.push(entry)
    this.sendMetric(entry)
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    // Define thresholds for different metrics
    const thresholds: Record<string, [number, number]> = {
      'route-load-time': [2000, 4000],
      'dom-content-loaded': [1500, 3000],
      'first-paint': [1000, 2500]
    }
    
    const [good, poor] = thresholds[name] || [100, 300]
    
    if (value <= good) return 'good'
    if (value <= poor) return 'needs-improvement'
    return 'poor'
  }

  private async sendMetric(entry: PerformanceEntry) {
    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...entry,
          url: window.location.href,
          userAgent: navigator.userAgent,
          connection: (navigator as any).connection?.effectiveType
        })
      })
    } catch (error) {
      console.error('Failed to send performance metric:', error)
    }
  }

  getMetrics(): PerformanceEntry[] {
    return [...this.entries]
  }

  generateReport() {
    const report = this.entries.reduce((acc, entry) => {
      if (!acc[entry.name]) {
        acc[entry.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: 0,
          ratings: { good: 0, 'needs-improvement': 0, poor: 0 }
        }
      }
      
      const metric = acc[entry.name]
      metric.count++
      metric.total += entry.value
      metric.min = Math.min(metric.min, entry.value)
      metric.max = Math.max(metric.max, entry.value)
      metric.ratings[entry.rating]++
      
      return acc
    }, {} as Record<string, any>)
    
    // Calculate averages
    Object.values(report).forEach((metric: any) => {
      metric.average = metric.total / metric.count
    })
    
    return report
  }
}

export const performanceTracker = new PerformanceTracker()

// Export for debugging
;(window as any).performanceTracker = performanceTracker
```

---

## 🏷️ Tags

#performance #optimization #react #nodejs #database #caching #monitoring #web-vitals

**Related Documentation:**
- [[OBSERVABILITY]] - Performance monitoring and alerting
- [[ARCHITECTURE]] - System architecture and design patterns
- [[DATABASE_DESIGN]] - Database schema and indexing
- [[FRONTEND_ARCHITECTURE]] - React performance patterns

---

> [!NOTE] **Document Maintenance**
> **Last Updated:** {date}  
> **Version:** 1.0.0  
> **Maintainers:** Performance Team (Lazaro, Alexy, Massi, Lounis)

> [!TIP] **Performance Best Practices**
> - Measure first, optimize second
> - Focus on user-perceived performance
> - Use caching strategically
> - Optimize critical rendering path
> - Monitor performance in production
> - Set performance budgets and alerts
