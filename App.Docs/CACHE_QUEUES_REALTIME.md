# Caching, Queues & Real-time Features

## Overview

This document outlines the caching strategy, background job processing, and real-time features implementation for the NCY_8 platform using Redis, BullMQ, and WebSocket technologies.

## Redis Caching Strategy

### Redis Architecture

**Technology Stack**:
- **Redis**: 7+ with clustering support
- **Connection Pooling**: ioredis with connection management
- **Serialization**: JSON with compression for large objects
- **TTL Management**: Automatic expiration with refresh patterns

### Cache Layers

```typescript
// Multi-layer caching strategy
export class CacheService {
  private redis: Redis;
  private localCache: Map<string, { data: any; expiry: number }>;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT!),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.localCache = new Map();
  }

  // L1: Local memory cache (fastest, limited size)
  async getLocal<T>(key: string): Promise<T | null> {
    const cached = this.localCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.localCache.delete(key);
    return null;
  }

  // L2: Redis cache (fast, distributed)
  async getRedis<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  // L3: Database (slowest, authoritative)
  async get<T>(key: string, fetcher: () => Promise<T>, ttl: number = 300): Promise<T> {
    // Try L1 cache first
    const localData = await this.getLocal<T>(key);
    if (localData) return localData;

    // Try L2 cache
    const redisData = await this.getRedis<T>(key);
    if (redisData) {
      // Populate L1 cache
      this.localCache.set(key, {
        data: redisData,
        expiry: Date.now() + 60000, // 1 minute local cache
      });
      return redisData;
    }

    // Fetch from database
    const data = await fetcher();
    
    // Store in both caches
    await this.set(key, data, ttl);
    
    return data;
  }

  async set(key: string, data: any, ttl: number = 300): Promise<void> {
    // Store in Redis
    await this.redis.setex(key, ttl, JSON.stringify(data));
    
    // Store in local cache
    this.localCache.set(key, {
      data,
      expiry: Date.now() + Math.min(ttl * 1000, 60000), // Max 1 minute local
    });
  }
}
```

### Key Naming Conventions

```typescript
// Cache key patterns
export class CacheKeys {
  // User data
  static user(id: string): string {
    return `user:${id}`;
  }

  static userSessions(userId: string): string {
    return `user_sessions:${userId}`;
  }

  // Organization data
  static organization(id: string): string {
    return `org:${id}`;
  }

  static organizationMembers(orgId: string): string {
    return `org_members:${orgId}`;
  }

  // Project data
  static project(id: string): string {
    return `project:${id}`;
  }

  static projectTasks(projectId: string): string {
    return `project_tasks:${projectId}`;
  }

  // API responses
  static apiResponse(endpoint: string, params: any): string {
    const hash = crypto.createHash('md5').update(JSON.stringify(params)).digest('hex');
    return `api:${endpoint}:${hash}`;
  }

  // Rate limiting
  static rateLimit(type: string, identifier: string): string {
    return `rate_limit:${type}:${identifier}`;
  }

  // Session data
  static session(sessionId: string): string {
    return `session:${sessionId}`;
  }

  // Real-time data
  static realtimeChannel(channel: string): string {
    return `realtime:${channel}`;
  }
}
```

### Cache Invalidation Strategies

```typescript
// Cache invalidation patterns
export class CacheInvalidationService {
  private redis: Redis;
  private cacheService: CacheService;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
    this.cacheService = new CacheService();
  }

  // Pattern-based invalidation
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // User data invalidation
  async invalidateUser(userId: string): Promise<void> {
    const patterns = [
      CacheKeys.user(userId),
      CacheKeys.userSessions(userId),
      `org_members:*`, // Invalidate all org member caches
      `project_tasks:*`, // Invalidate all project task caches
    ];

    await Promise.all(patterns.map(pattern => this.invalidatePattern(pattern)));
  }

  // Organization data invalidation
  async invalidateOrganization(orgId: string): Promise<void> {
    const patterns = [
      CacheKeys.organization(orgId),
      CacheKeys.organizationMembers(orgId),
      `project:${orgId}:*`,
      `project_tasks:*`,
    ];

    await Promise.all(patterns.map(pattern => this.invalidatePattern(pattern)));
  }

  // Project data invalidation
  async invalidateProject(projectId: string): Promise<void> {
    const patterns = [
      CacheKeys.project(projectId),
      CacheKeys.projectTasks(projectId),
    ];

    await Promise.all(patterns.map(pattern => this.invalidatePattern(pattern)));
  }

  // TTL-based refresh
  async refreshExpiringKeys(): Promise<void> {
    const keys = await this.redis.keys('*');
    
    for (const key of keys) {
      const ttl = await this.redis.ttl(key);
      
      // Refresh keys that expire in less than 60 seconds
      if (ttl > 0 && ttl < 60) {
        await this.refreshKey(key);
      }
    }
  }

  private async refreshKey(key: string): Promise<void> {
    // Implement key-specific refresh logic
    if (key.startsWith('user:')) {
      const userId = key.split(':')[1];
      // Refresh user data
    } else if (key.startsWith('org:')) {
      const orgId = key.split(':')[1];
      // Refresh organization data
    }
  }
}
```

## Background Job Processing

### BullMQ Configuration

```typescript
// BullMQ setup
import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';

const redisConnection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
});

// Job queues
export const emailQueue = new Queue('email', { connection: redisConnection });
export const notificationQueue = new Queue('notification', { connection: redisConnection });
export const reportQueue = new Queue('report', { connection: redisConnection });
export const cleanupQueue = new Queue('cleanup', { connection: redisConnection });

// Job types
export enum JobType {
  SEND_EMAIL = 'send-email',
  SEND_NOTIFICATION = 'send-notification',
  GENERATE_REPORT = 'generate-report',
  CLEANUP_OLD_DATA = 'cleanup-old-data',
  BACKUP_DATABASE = 'backup-database',
  SEND_WELCOME_EMAIL = 'send-welcome-email',
}
```

### Job Definitions

```typescript
// Job definitions
export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  priority?: number;
}

export interface NotificationJobData {
  userId: string;
  type: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface ReportJobData {
  userId: string;
  reportType: string;
  parameters: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv';
}

// Job processors
export class JobProcessor {
  static async processEmail(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, template, data } = job.data;
    
    try {
      await emailService.sendEmail({
        to,
        subject,
        template,
        data,
      });
      
      await job.updateProgress(100);
    } catch (error) {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  static async processNotification(job: Job<NotificationJobData>): Promise<void> {
    const { userId, type, message, metadata } = job.data;
    
    try {
      await notificationService.createNotification({
        userId,
        type,
        message,
        metadata,
      });
      
      // Send real-time notification
      await realtimeService.sendToUser(userId, {
        type: 'notification',
        data: { type, message, metadata },
      });
      
      await job.updateProgress(100);
    } catch (error) {
      throw new Error(`Notification processing failed: ${error.message}`);
    }
  }

  static async processReport(job: Job<ReportJobData>): Promise<void> {
    const { userId, reportType, parameters, format } = job.data;
    
    try {
      await job.updateProgress(10);
      
      const data = await reportService.generateReport(reportType, parameters);
      await job.updateProgress(50);
      
      const file = await reportService.exportReport(data, format);
      await job.updateProgress(80);
      
      await reportService.sendReportToUser(userId, file);
      await job.updateProgress(100);
    } catch (error) {
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }
}
```

### Worker Configuration

```typescript
// Worker setup
export class WorkerManager {
  private workers: Worker[] = [];

  async startWorkers(): Promise<void> {
    // Email worker
    const emailWorker = new Worker('email', JobProcessor.processEmail, {
      connection: redisConnection,
      concurrency: 5,
      limiter: {
        max: 100,
        duration: 60000, // 100 emails per minute
      },
    });

    // Notification worker
    const notificationWorker = new Worker('notification', JobProcessor.processNotification, {
      connection: redisConnection,
      concurrency: 10,
    });

    // Report worker
    const reportWorker = new Worker('report', JobProcessor.processReport, {
      connection: redisConnection,
      concurrency: 2,
      limiter: {
        max: 10,
        duration: 60000, // 10 reports per minute
      },
    });

    this.workers = [emailWorker, notificationWorker, reportWorker];

    // Error handling
    this.workers.forEach(worker => {
      worker.on('failed', (job, err) => {
        console.error(`Job ${job?.id} failed:`, err);
      });

      worker.on('completed', (job) => {
        console.log(`Job ${job.id} completed`);
      });
    });
  }

  async stopWorkers(): Promise<void> {
    await Promise.all(this.workers.map(worker => worker.close()));
  }
}
```

### Job Scheduling

```typescript
// Job scheduling
export class JobScheduler {
  private queues: Map<string, Queue> = new Map();

  constructor() {
    this.queues.set('email', emailQueue);
    this.queues.set('notification', notificationQueue);
    this.queues.set('report', reportQueue);
    this.queues.set('cleanup', cleanupQueue);
  }

  // Schedule immediate job
  async scheduleJob<T>(
    queueName: string,
    jobType: string,
    data: T,
    options?: {
      priority?: number;
      delay?: number;
      attempts?: number;
      backoff?: {
        type: 'exponential' | 'fixed';
        delay: number;
      };
    }
  ): Promise<Job<T>> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return queue.add(jobType, data, {
      priority: options?.priority || 0,
      delay: options?.delay || 0,
      attempts: options?.attempts || 3,
      backoff: options?.backoff || {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  // Schedule recurring job
  async scheduleRecurringJob<T>(
    queueName: string,
    jobType: string,
    data: T,
    cronExpression: string
  ): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.add(jobType, data, {
      repeat: {
        pattern: cronExpression,
      },
    });
  }

  // Schedule cleanup jobs
  async scheduleCleanupJobs(): Promise<void> {
    // Daily cleanup at 2 AM
    await this.scheduleRecurringJob(
      'cleanup',
      JobType.CLEANUP_OLD_DATA,
      { type: 'daily' },
      '0 2 * * *'
    );

    // Weekly backup on Sunday at 3 AM
    await this.scheduleRecurringJob(
      'cleanup',
      JobType.BACKUP_DATABASE,
      { type: 'weekly' },
      '0 3 * * 0'
    );
  }
}
```

### Dead Letter Queue

```typescript
// Dead letter queue handling
export class DeadLetterQueueService {
  private dlqQueue = new Queue('dead-letter', { connection: redisConnection });

  async handleFailedJob(job: Job, error: Error): Promise<void> {
    console.error(`Job ${job.id} failed after ${job.attemptsMade} attempts:`, error);

    // Move to dead letter queue
    await this.dlqQueue.add('failed-job', {
      originalQueue: job.queueName,
      originalJobType: job.name,
      originalData: job.data,
      error: error.message,
      failedAt: new Date().toISOString(),
      attemptsMade: job.attemptsMade,
    });

    // Send alert to administrators
    await notificationService.sendAlert({
      type: 'JOB_FAILED',
      message: `Job ${job.id} failed: ${error.message}`,
      severity: 'HIGH',
      metadata: {
        jobId: job.id,
        queue: job.queueName,
        jobType: job.name,
        attempts: job.attemptsMade,
      },
    });
  }

  async retryFailedJob(jobData: any): Promise<void> {
    const { originalQueue, originalJobType, originalData } = jobData;
    
    // Retry the original job
    await jobScheduler.scheduleJob(
      originalQueue,
      originalJobType,
      originalData,
      {
        attempts: 1, // Single retry attempt
        priority: 10, // High priority for retries
      }
    );
  }
}
```

## Real-time Features

### WebSocket Implementation

```typescript
// WebSocket server
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Redis } from 'ioredis';

export class RealtimeService {
  private io: SocketIOServer;
  private redis: Redis;
  private redisSubscriber: Redis;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.redis = new Redis(process.env.REDIS_URL!);
    this.redisSubscriber = new Redis(process.env.REDIS_URL!);

    this.setupEventHandlers();
    this.setupRedisSubscriptions();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Authentication
      socket.on('authenticate', async (token: string) => {
        try {
          const user = await this.authenticateUser(token);
          if (user) {
            socket.userId = user.id;
            socket.join(`user:${user.id}`);
            socket.join(`org:${user.organizationId}`);
            
            socket.emit('authenticated', { userId: user.id });
          } else {
            socket.emit('authentication_failed');
            socket.disconnect();
          }
        } catch (error) {
          socket.emit('authentication_error', error.message);
          socket.disconnect();
        }
      });

      // Join project room
      socket.on('join_project', (projectId: string) => {
        if (socket.userId) {
          socket.join(`project:${projectId}`);
        }
      });

      // Leave project room
      socket.on('leave_project', (projectId: string) => {
        socket.leave(`project:${projectId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  private setupRedisSubscriptions(): void {
    // Subscribe to Redis channels for cross-server communication
    this.redisSubscriber.subscribe('realtime:notifications');
    this.redisSubscriber.subscribe('realtime:projects');
    this.redisSubscriber.subscribe('realtime:users');

    this.redisSubscriber.on('message', (channel, message) => {
      const data = JSON.parse(message);
      
      switch (channel) {
        case 'realtime:notifications':
          this.handleNotificationBroadcast(data);
          break;
        case 'realtime:projects':
          this.handleProjectBroadcast(data);
          break;
        case 'realtime:users':
          this.handleUserBroadcast(data);
          break;
      }
    });
  }

  // Send message to specific user
  async sendToUser(userId: string, message: any): Promise<void> {
    this.io.to(`user:${userId}`).emit('message', message);
  }

  // Send message to organization
  async sendToOrganization(orgId: string, message: any): Promise<void> {
    this.io.to(`org:${orgId}`).emit('message', message);
  }

  // Send message to project
  async sendToProject(projectId: string, message: any): Promise<void> {
    this.io.to(`project:${projectId}`).emit('message', message);
  }

  // Broadcast to all connected clients
  async broadcast(message: any): Promise<void> {
    this.io.emit('message', message);
  }

  // Publish to Redis for cross-server communication
  async publishToRedis(channel: string, data: any): Promise<void> {
    await this.redis.publish(channel, JSON.stringify(data));
  }

  private handleNotificationBroadcast(data: any): void {
    if (data.userId) {
      this.sendToUser(data.userId, {
        type: 'notification',
        data: data.notification,
      });
    }
  }

  private handleProjectBroadcast(data: any): void {
    this.sendToProject(data.projectId, {
      type: 'project_update',
      data: data.update,
    });
  }

  private handleUserBroadcast(data: any): void {
    if (data.userId) {
      this.sendToUser(data.userId, {
        type: 'user_update',
        data: data.update,
      });
    }
  }

  private async authenticateUser(token: string): Promise<User | null> {
    // Implement JWT token validation
    const authService = new AuthService();
    const payload = await authService.validateAccessToken(token);
    
    if (payload) {
      return await authService.getUserById(payload.userId);
    }
    
    return null;
  }
}
```

### Real-time Event Handlers

```typescript
// Real-time event handlers
export class RealtimeEventHandler {
  private realtimeService: RealtimeService;
  private redis: Redis;

  constructor(realtimeService: RealtimeService) {
    this.realtimeService = realtimeService;
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  // Handle task updates
  async handleTaskUpdate(taskId: string, update: any): Promise<void> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (task) {
      // Notify project members
      await this.realtimeService.publishToRedis('realtime:projects', {
        projectId: task.projectId,
        update: {
          type: 'task_updated',
          taskId,
          update,
        },
      });

      // Notify assignee
      if (task.assigneeId) {
        await this.realtimeService.publishToRedis('realtime:notifications', {
          userId: task.assigneeId,
          notification: {
            type: 'TASK_UPDATED',
            message: `Task "${task.title}" has been updated`,
            taskId,
          },
        });
      }
    }
  }

  // Handle user status changes
  async handleUserStatusChange(userId: string, status: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organizationMembers: true },
    });

    if (user) {
      // Notify organization members
      for (const member of user.organizationMembers) {
        await this.realtimeService.publishToRedis('realtime:users', {
          userId: member.userId,
          update: {
            type: 'user_status_changed',
            userId,
            status,
          },
        });
      }
    }
  }

  // Handle project creation
  async handleProjectCreated(projectId: string): Promise<void> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { organization: { include: { members: true } } },
    });

    if (project) {
      // Notify organization members
      await this.realtimeService.publishToRedis('realtime:projects', {
        projectId,
        update: {
          type: 'project_created',
          project: {
            id: project.id,
            name: project.name,
            description: project.description,
          },
        },
      });
    }
  }
}
```

## Performance Monitoring

### Cache Performance Metrics

```typescript
// Cache performance monitoring
import { prometheus } from 'prom-client';

const cacheHits = new prometheus.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_layer', 'key_pattern'],
});

const cacheMisses = new prometheus.Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_layer', 'key_pattern'],
});

const cacheOperationDuration = new prometheus.Histogram({
  name: 'cache_operation_duration_seconds',
  help: 'Duration of cache operations',
  labelNames: ['operation', 'cache_layer'],
});

export class CacheMetrics {
  static recordHit(layer: string, keyPattern: string): void {
    cacheHits.inc({ cache_layer: layer, key_pattern: keyPattern });
  }

  static recordMiss(layer: string, keyPattern: string): void {
    cacheMisses.inc({ cache_layer: layer, key_pattern: keyPattern });
  }

  static recordOperation(operation: string, layer: string, duration: number): void {
    cacheOperationDuration.observe({ operation, cache_layer: layer }, duration);
  }
}
```

### Queue Performance Metrics

```typescript
// Queue performance monitoring
const queueJobs = new prometheus.Counter({
  name: 'queue_jobs_total',
  help: 'Total number of queue jobs',
  labelNames: ['queue', 'job_type', 'status'],
});

const queueJobDuration = new prometheus.Histogram({
  name: 'queue_job_duration_seconds',
  help: 'Duration of queue jobs',
  labelNames: ['queue', 'job_type'],
});

const queueSize = new prometheus.Gauge({
  name: 'queue_size',
  help: 'Current queue size',
  labelNames: ['queue'],
});

export class QueueMetrics {
  static recordJob(queue: string, jobType: string, status: 'completed' | 'failed'): void {
    queueJobs.inc({ queue, job_type: jobType, status });
  }

  static recordJobDuration(queue: string, jobType: string, duration: number): void {
    queueJobDuration.observe({ queue, job_type: jobType }, duration);
  }

  static updateQueueSize(queue: string, size: number): void {
    queueSize.set({ queue }, size);
  }
}
```

---

*This caching, queuing, and real-time strategy provides scalable, performant, and responsive user experiences while maintaining system reliability.*
