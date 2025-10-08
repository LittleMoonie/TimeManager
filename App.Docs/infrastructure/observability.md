# Observability & Monitoring

## Overview

This document outlines the comprehensive observability strategy for the NCY_8 platform, including metrics collection, logging, tracing, alerting, and performance monitoring using Prometheus, Grafana, Loki, and custom instrumentation.

## Monitoring Architecture

### Technology Stack

- **Metrics**: Prometheus + custom exporters
- **Visualization**: Grafana dashboards
- **Logging**: Pino → Loki → Grafana
- **Tracing**: OpenTelemetry with Jaeger
- **Alerting**: Alertmanager + PagerDuty/Slack
- **Health Checks**: Custom endpoints + Kubernetes probes

### Monitoring Stack Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Infrastructure│    │   External      │
│   Metrics       │    │   Metrics       │    │   Services      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
    ┌─────▼─────┐          ┌─────▼─────┐          ┌─────▼─────┐
    │ Prometheus│          │ Node      │          │ Database  │
    │ Server    │          │ Exporter  │          │ Exporter  │
    └─────┬─────┘          └───────────┘          └─────┬─────┘
          │                                             │
    ┌─────▼─────┐    ┌─────────────────┐    ┌─────────▼─────┐
    │ Grafana   │    │   Alertmanager  │    │   Redis       │
    │ Dashboards│    │   + Notifications│    │   Exporter    │
    └───────────┘    └─────────────────┘    └───────────────┘
```

## Metrics Collection

### Application Metrics

```typescript
// Prometheus metrics setup
import { register, Counter, Histogram, Gauge, Summary } from 'prom-client';

// HTTP request metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

// Business metrics
const userRegistrations = new Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
  labelNames: ['organization_id'],
});

const activeUsers = new Gauge({
  name: 'active_users_total',
  help: 'Number of currently active users',
  labelNames: ['organization_id'],
});

const projectCreationRate = new Counter({
  name: 'projects_created_total',
  help: 'Total number of projects created',
  labelNames: ['organization_id', 'project_type'],
});

// Database metrics
const databaseConnections = new Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
});

const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['query_type', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

// Cache metrics
const cacheOperations = new Counter({
  name: 'cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'cache_layer', 'result'],
});

const cacheHitRate = new Gauge({
  name: 'cache_hit_rate',
  help: 'Cache hit rate percentage',
  labelNames: ['cache_layer'],
});

// Queue metrics
const queueJobs = new Counter({
  name: 'queue_jobs_total',
  help: 'Total number of queue jobs',
  labelNames: ['queue', 'job_type', 'status'],
});

const queueJobDuration = new Histogram({
  name: 'queue_job_duration_seconds',
  help: 'Duration of queue jobs',
  labelNames: ['queue', 'job_type'],
});

// Register all metrics
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);
register.registerMetric(userRegistrations);
register.registerMetric(activeUsers);
register.registerMetric(projectCreationRate);
register.registerMetric(databaseConnections);
register.registerMetric(databaseQueryDuration);
register.registerMetric(cacheOperations);
register.registerMetric(cacheHitRate);
register.registerMetric(queueJobs);
register.registerMetric(queueJobDuration);
```

### Metrics Middleware

```typescript
// Express metrics middleware
import { Request, Response, NextFunction } from 'express';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    });
    
    httpRequestDuration.observe({
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    }, duration);
  });
  
  next();
};

// Database metrics wrapper
export const withDatabaseMetrics = <T extends any[], R>(
  queryType: string,
  table: string,
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    const start = Date.now();
    
    try {
      const result = await fn(...args);
      const duration = (Date.now() - start) / 1000;
      
      databaseQueryDuration.observe({ query_type: queryType, table }, duration);
      return result;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      databaseQueryDuration.observe({ query_type: queryType, table }, duration);
      throw error;
    }
  };
};

// Cache metrics wrapper
export const withCacheMetrics = <T extends any[], R>(
  operation: string,
  cacheLayer: string,
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    const start = Date.now();
    
    try {
      const result = await fn(...args);
      const duration = (Date.now() - start) / 1000;
      
      cacheOperations.inc({ operation, cache_layer: cacheLayer, result: 'success' });
      return result;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      cacheOperations.inc({ operation, cache_layer: cacheLayer, result: 'error' });
      throw error;
    }
  };
};
```

### Custom Metrics Collection

```typescript
// Custom metrics service
export class MetricsService {
  // User activity metrics
  static recordUserRegistration(organizationId: string): void {
    userRegistrations.inc({ organization_id: organizationId });
  }

  static updateActiveUsers(organizationId: string, count: number): void {
    activeUsers.set({ organization_id: organizationId }, count);
  }

  // Project metrics
  static recordProjectCreation(organizationId: string, projectType: string): void {
    projectCreationRate.inc({ 
      organization_id: organizationId, 
      project_type: projectType 
    });
  }

  // Cache metrics
  static recordCacheHit(cacheLayer: string): void {
    cacheOperations.inc({ 
      operation: 'get', 
      cache_layer: cacheLayer, 
      result: 'hit' 
    });
  }

  static recordCacheMiss(cacheLayer: string): void {
    cacheOperations.inc({ 
      operation: 'get', 
      cache_layer: cacheLayer, 
      result: 'miss' 
    });
  }

  // Queue metrics
  static recordJobCompletion(queue: string, jobType: string, duration: number): void {
    queueJobs.inc({ queue, job_type: jobType, status: 'completed' });
    queueJobDuration.observe({ queue, job_type: jobType }, duration);
  }

  static recordJobFailure(queue: string, jobType: string, duration: number): void {
    queueJobs.inc({ queue, job_type: jobType, status: 'failed' });
    queueJobDuration.observe({ queue, job_type: jobType }, duration);
  }

  // System metrics
  static updateDatabaseConnections(count: number): void {
    databaseConnections.set(count);
  }

  static updateCacheHitRate(cacheLayer: string, rate: number): void {
    cacheHitRate.set({ cache_layer: cacheLayer }, rate);
  }
}
```

## Structured Logging

### Pino Logger Configuration

```typescript
// Logger configuration
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'password',
      'passwordHash',
      'token',
      'authorization',
      'cookie',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
});

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  req.log = logger.child({
    requestId: req.headers['x-request-id'] || generateRequestId(),
    userId: req.user?.id,
    organizationId: req.user?.organizationId,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  req.log.info({
    method: req.method,
    url: req.url,
    headers: req.headers,
  }, 'Incoming request');
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    req.log.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
    }, 'Request completed');
  });
  
  next();
};

// Error logging
export const errorLogger = (error: Error, req: Request) => {
  const log = req.log || logger;
  
  log.error({
    err: error,
    stack: error.stack,
    requestId: req.headers['x-request-id'],
    userId: req.user?.id,
    method: req.method,
    url: req.url,
  }, 'Request error');
};
```

### Log Aggregation with Loki

```yaml
# docker-compose.logging.yml
version: '3.8'
services:
  loki:
    image: grafana/loki:2.8.0
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml

  promtail:
    image: grafana/promtail:2.8.0
    volumes:
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml

  grafana:
    image: grafana/grafana:10.0.0
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana
      - ./grafana-provisioning:/etc/grafana/provisioning

volumes:
  grafana-storage:
```

```yaml
# promtail-config.yml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: ncy-8-logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: ncy-8
          service: ncy-8-api
          __path__: /var/log/ncy-8/*.log

  - job_name: docker-logs
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container_name'
      - source_labels: ['__meta_docker_container_log_stream']
        target_label: 'logstream'
```

## Health Checks

### Health Check Endpoints

```typescript
// Health check implementation
export class HealthCheckService {
  private checks: Map<string, () => Promise<boolean>> = new Map();

  constructor() {
    this.registerChecks();
  }

  private registerChecks(): void {
    // Database health check
    this.checks.set('database', async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
      } catch (error) {
        return false;
      }
    });

    // Redis health check
    this.checks.set('redis', async () => {
      try {
        const redis = new Redis(process.env.REDIS_URL!);
        await redis.ping();
        await redis.quit();
        return true;
      } catch (error) {
        return false;
      }
    });

    // External API health check
    this.checks.set('external_api', async () => {
      try {
        const response = await fetch('https://api.external-service.com/health', {
          timeout: 5000,
        });
        return response.ok;
      } catch (error) {
        return false;
      }
    });
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy';
    checks: Record<string, boolean>;
    timestamp: string;
  }> {
    const checkResults: Record<string, boolean> = {};
    
    for (const [name, check] of this.checks) {
      try {
        checkResults[name] = await check();
      } catch (error) {
        checkResults[name] = false;
      }
    }

    const allHealthy = Object.values(checkResults).every(result => result);
    
    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks: checkResults,
      timestamp: new Date().toISOString(),
    };
  }

  async getReadinessStatus(): Promise<{
    status: 'ready' | 'not_ready';
    checks: Record<string, boolean>;
    timestamp: string;
  }> {
    // Readiness checks are more comprehensive than liveness checks
    const readinessChecks = ['database', 'redis'];
    const checkResults: Record<string, boolean> = {};
    
    for (const checkName of readinessChecks) {
      const check = this.checks.get(checkName);
      if (check) {
        try {
          checkResults[checkName] = await check();
        } catch (error) {
          checkResults[checkName] = false;
        }
      }
    }

    const allReady = Object.values(checkResults).every(result => result);
    
    return {
      status: allReady ? 'ready' : 'not_ready',
      checks: checkResults,
      timestamp: new Date().toISOString(),
    };
  }
}

// Health check routes
export const healthRoutes = (app: Express) => {
  const healthService = new HealthCheckService();

  // Liveness probe
  app.get('/api/health', async (req, res) => {
    const health = await healthService.getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  });

  // Readiness probe
  app.get('/api/ready', async (req, res) => {
    const readiness = await healthService.getReadinessStatus();
    const statusCode = readiness.status === 'ready' ? 200 : 503;
    res.status(statusCode).json(readiness);
  });

  // Metrics endpoint
  app.get('/api/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });
};
```

## Alerting & SLOs

### Alert Rules Configuration

```yaml
# alert-rules.yml
groups:
  - name: ncy-8-alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      # High response time
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"

      # Database connection issues
      - alert: DatabaseConnectionIssues
        expr: database_connections_active < 1
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection issues"
          description: "No active database connections"

      # High memory usage
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      # Queue backup
      - alert: QueueBackup
        expr: queue_size > 1000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Queue backup detected"
          description: "Queue {{ $labels.queue }} has {{ $value }} pending jobs"

      # Cache hit rate low
      - alert: LowCacheHitRate
        expr: cache_hit_rate < 0.8
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Low cache hit rate"
          description: "Cache hit rate is {{ $value | humanizePercentage }}"
```

### SLO Definitions

```typescript
// SLO (Service Level Objectives) definitions
export const SLOs = {
  availability: {
    target: 99.9, // 99.9% uptime
    window: '30d',
    measurement: 'uptime',
  },
  latency: {
    target: 200, // 200ms p95 latency
    window: '5m',
    measurement: 'response_time_p95',
  },
  errorRate: {
    target: 0.1, // 0.1% error rate
    window: '5m',
    measurement: 'error_rate',
  },
  throughput: {
    target: 1000, // 1000 requests per second
    window: '1m',
    measurement: 'requests_per_second',
  },
};

// SLO monitoring
export class SLOMonitor {
  private prometheus = new PrometheusClient();

  async checkAvailability(): Promise<{
    current: number;
    target: number;
    status: 'meeting' | 'violating';
  }> {
    const query = `
      (
        sum(rate(http_requests_total{status_code!~"5.."}[5m])) /
        sum(rate(http_requests_total[5m]))
      ) * 100
    `;
    
    const result = await this.prometheus.query(query);
    const current = result[0]?.value[1] || 0;
    
    return {
      current: parseFloat(current),
      target: SLOs.availability.target,
      status: parseFloat(current) >= SLOs.availability.target ? 'meeting' : 'violating',
    };
  }

  async checkLatency(): Promise<{
    current: number;
    target: number;
    status: 'meeting' | 'violating';
  }> {
    const query = `
      histogram_quantile(0.95, 
        sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
      ) * 1000
    `;
    
    const result = await this.prometheus.query(query);
    const current = result[0]?.value[1] || 0;
    
    return {
      current: parseFloat(current),
      target: SLOs.latency.target,
      status: parseFloat(current) <= SLOs.latency.target ? 'meeting' : 'violating',
    };
  }

  async checkErrorRate(): Promise<{
    current: number;
    target: number;
    status: 'meeting' | 'violating';
  }> {
    const query = `
      (
        sum(rate(http_requests_total{status_code=~"5.."}[5m])) /
        sum(rate(http_requests_total[5m]))
      ) * 100
    `;
    
    const result = await this.prometheus.query(query);
    const current = result[0]?.value[1] || 0;
    
    return {
      current: parseFloat(current),
      target: SLOs.errorRate.target,
      status: parseFloat(current) <= SLOs.errorRate.target ? 'meeting' : 'violating',
    };
  }

  async generateSLOReport(): Promise<{
    availability: any;
    latency: any;
    errorRate: any;
    overall: 'meeting' | 'violating';
  }> {
    const [availability, latency, errorRate] = await Promise.all([
      this.checkAvailability(),
      this.checkLatency(),
      this.checkErrorRate(),
    ]);

    const overall = [availability, latency, errorRate].every(
      slo => slo.status === 'meeting'
    ) ? 'meeting' : 'violating';

    return {
      availability,
      latency,
      errorRate,
      overall,
    };
  }
}
```

## Distributed Tracing

### OpenTelemetry Setup

```typescript
// OpenTelemetry configuration
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'ncy-8-api',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version,
  }),
  traceExporter: new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  }),
  metricReader: new PrometheusExporter({
    port: 9464,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

sdk.start();

// Custom tracing
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

export const tracer = trace.getTracer('ncy-8-api');

export function withTrace<T extends any[], R>(
  name: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const span = tracer.startSpan(name);
    
    try {
      const result = await context.with(trace.setSpan(context.active(), span), () => {
        return fn(...args);
      });
      
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  };
}
```

## Grafana Dashboards

### Dashboard Configuration

```json
{
  "dashboard": {
    "title": "NCY-8 Application Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (method)",
            "legendFormat": "{{method}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "50th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status_code=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])) * 100",
            "legendFormat": "Error Rate %"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(active_users_total)",
            "legendFormat": "Active Users"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "database_connections_active",
            "legendFormat": "Active Connections"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "cache_hit_rate",
            "legendFormat": "{{cache_layer}}"
          }
        ]
      }
    ]
  }
}
```

---

*This observability strategy provides comprehensive monitoring, alerting, and debugging capabilities to ensure system reliability and performance.*
