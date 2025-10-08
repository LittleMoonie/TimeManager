# GoGoTime Environment Configuration

> [!SUMMARY] **Complete Environment Guide**
> Comprehensive guide for configuring GoGoTime across development, staging, and production environments with security best practices and deployment strategies.

## 📋 Table of Contents

- [[#🌍 Environment Overview|Environment Overview]]
- [[#⚙️ Configuration Variables|Configuration Variables]]
- [[#🔒 Security Configuration|Security Configuration]]
- [[#🏗️ Environment-Specific Setup|Environment-Specific Setup]]
- [[#🔐 Secrets Management|Secrets Management]]
- [[#📊 Monitoring Configuration|Monitoring Configuration]]

---

## 🌍 Environment Overview

### 🎯 Environment Types

GoGoTime supports multiple environment configurations:

```mermaid
graph TB
    subgraph "Environment Hierarchy"
        DEV[🛠️ Development<br/>Local development<br/>Hot reload enabled<br/>Debug logging]
        STAGING[🎭 Staging<br/>Production-like<br/>Testing environment<br/>Performance monitoring]
        PROD[🚀 Production<br/>Optimized build<br/>Security hardened<br/>Full monitoring]
    end
    
    subgraph "Configuration Flow"
        ENV[📄 .env files]
        DOCKER[🐳 Docker Compose]
        K8S[⚓ Kubernetes ConfigMaps]
        SECRETS[🔐 Secret Management]
    end
    
    DEV --> ENV
    STAGING --> DOCKER
    PROD --> K8S
    K8S --> SECRETS
```

### 📊 Environment Comparison

| Aspect | Development | Staging | Production |
|--------|-------------|---------|------------|
| **Database** | SQLite/Local PG | PostgreSQL | PostgreSQL Cluster |
| **Caching** | In-memory | Redis | Redis Cluster |
| **Security** | Relaxed | Strict | Maximum |
| **Monitoring** | Basic | Comprehensive | Full Stack |
| **SSL** | Optional | Required | Required + HSTS |
| **Performance** | Debug Mode | Optimized | Maximum |

---

## ⚙️ Configuration Variables

### 🏗️ Core Configuration

**`.env.example` Template:**
```bash
# =============================================================================
# 🌍 ENVIRONMENT CONFIGURATION
# =============================================================================

# Environment Type
NODE_ENV=development                    # development | staging | production

# =============================================================================
# 📡 API CONFIGURATION
# =============================================================================

# Server Settings
API_PORT=4000
API_HOST=0.0.0.0
API_BASE_URL=http://localhost:4000/api

# Request Settings
REQUEST_TIMEOUT=30000                   # 30 seconds
MAX_REQUEST_SIZE=10mb
RATE_LIMIT_WINDOW=900000               # 15 minutes
RATE_LIMIT_MAX=100                     # Requests per window

# =============================================================================
# 🗄️ DATABASE CONFIGURATION
# =============================================================================

# PostgreSQL Settings
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_secure_password_here
DB_NAME=gogotime_dev
DB_SSL=false                           # true for production
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_TIMEOUT=60000                       # Connection timeout (ms)

# =============================================================================
# 🔐 AUTHENTICATION & SECURITY
# =============================================================================

# JWT Configuration
SECRET=your_64_character_jwt_secret_key_here_must_be_very_secure_random_string
JWT_EXPIRES_IN=86400                   # 24 hours (seconds)
JWT_REFRESH_EXPIRES_IN=2592000         # 30 days (seconds)
JWT_ALGORITHM=HS256

# Password Security
BCRYPT_ROUNDS=12                       # 10-12 for production
PASSWORD_MIN_LENGTH=8
PASSWORD_MAX_LENGTH=128

# Session Management
SESSION_TIMEOUT=86400                  # 24 hours (seconds)
MAX_SESSIONS_PER_USER=5               # Concurrent sessions
SESSION_CLEANUP_INTERVAL=3600          # 1 hour (seconds)

# =============================================================================
# 🌐 FRONTEND CONFIGURATION
# =============================================================================

# Vite/React Settings
WEB_PORT=3000
WEB_HOST=0.0.0.0
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=GoGoTime
VITE_APP_VERSION=1.0.0

# Build Settings
VITE_BUILD_TARGET=es2020
VITE_SOURCEMAP=true                    # false for production
VITE_MINIFY=false                      # true for production

# =============================================================================
# 🔒 CORS & SECURITY
# =============================================================================

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=Content-Type,Authorization,X-Requested-With

# Security Headers
HSTS_MAX_AGE=63072000                  # 2 years
CSP_REPORT_URI=https://yourdomain.com/csp-report
REFERRER_POLICY=strict-origin-when-cross-origin

# =============================================================================
# 📊 LOGGING & MONITORING
# =============================================================================

# Logging Configuration
LOG_LEVEL=debug                        # error | warn | info | debug
LOG_FORMAT=json                        # json | simple
LOG_FILE=/var/log/gogotime/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5
LOG_DATE_PATTERN=YYYY-MM-DD

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
HEALTH_CHECK_INTERVAL=30000            # 30 seconds

# =============================================================================
# 🚀 PERFORMANCE & OPTIMIZATION
# =============================================================================

# Node.js Optimization
NODE_OPTIONS="--max-old-space-size=2048"
UV_THREADPOOL_SIZE=4

# Caching
CACHE_TTL=3600                         # 1 hour (seconds)
CACHE_MAX_SIZE=100                     # MB
STATIC_CACHE_CONTROL=public,max-age=31536000  # 1 year

# =============================================================================
# 🔧 DEVELOPMENT SETTINGS
# =============================================================================

# Development Only
DEBUG=gogotime:*
CHOKIDAR_USEPOLLING=true              # For file watching in Docker
WATCHPACK_POLLING=true                # For webpack watching
FORCE_COLOR=1                         # Colored terminal output

# Testing
TEST_DATABASE_URL=postgresql://postgres:test@localhost:5433/gogotime_test
TEST_TIMEOUT=10000                    # Test timeout (ms)

# =============================================================================
# ☁️ DEPLOYMENT CONFIGURATION
# =============================================================================

# Container Settings
DOCKER_REGISTRY=ghcr.io/your-org
IMAGE_TAG=latest

# Health Checks
HEALTH_CHECK_PATH=/health
READINESS_CHECK_PATH=/ready
LIVENESS_CHECK_PATH=/alive

# Graceful Shutdown
SHUTDOWN_TIMEOUT=30000                # 30 seconds
KEEP_ALIVE_TIMEOUT=5000              # 5 seconds
```

### 🔧 Variable Validation

**Environment Validation Schema:**
```typescript
// src/config/env-validation.ts
import Joi from 'joi'

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .default('development'),

  API_PORT: Joi.number()
    .port()
    .default(4000),

  DB_HOST: Joi.string()
    .hostname()
    .required(),

  DB_PORT: Joi.number()
    .port()
    .default(5432),

  DB_USER: Joi.string()
    .min(1)
    .required(),

  DB_PASS: Joi.string()
    .min(8)
    .required(),

  SECRET: Joi.string()
    .min(32)
    .required()
    .messages({
      'string.min': 'JWT secret must be at least 32 characters long'
    }),

  JWT_EXPIRES_IN: Joi.number()
    .positive()
    .default(86400),

  BCRYPT_ROUNDS: Joi.number()
    .min(10)
    .max(15)
    .default(12),

  CORS_ORIGIN: Joi.string()
    .required()
    .custom((value) => {
      const origins = value.split(',')
      origins.forEach(origin => {
        if (!Joi.string().uri().validate(origin.trim()).error) {
          return value
        }
      })
      throw new Error('Invalid CORS origins')
    }),

  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info')
})

export function validateEnv(env: Record<string, any>) {
  const { error, value } = envSchema.validate(env, {
    allowUnknown: true,
    stripUnknown: true
  })

  if (error) {
    throw new Error(`Environment validation error: ${error.message}`)
  }

  return value
}
```

---

## 🔒 Security Configuration

### 🛡️ Security Environment Variables

**Production Security Settings:**
```bash
# Strong Authentication
SECRET=generated_64_char_secret_from_crypto_random_bytes_here_12345678901234
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=3600                    # 1 hour (shorter for production)
JWT_REFRESH_EXPIRES_IN=604800          # 1 week

# Password Policy
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SYMBOLS=true
PASSWORD_MAX_AGE=7776000               # 90 days

# Session Security
SESSION_TIMEOUT=3600                   # 1 hour
MAX_SESSIONS_PER_USER=3               # Limit concurrent sessions
SESSION_SECURE=true                    # HTTPS only
SESSION_SAME_SITE=strict

# Rate Limiting
RATE_LIMIT_WINDOW=900000              # 15 minutes
RATE_LIMIT_MAX=50                     # Strict rate limiting
RATE_LIMIT_SKIP_SUCCESSFUL=true       # Only count failures
AUTH_RATE_LIMIT_MAX=5                 # Login attempts

# CORS Security
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
CORS_CREDENTIALS=true
CORS_PREFLIGHT_MAX_AGE=86400          # 24 hours

# Security Headers
HSTS_MAX_AGE=63072000                 # 2 years
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true
CSP_DEFAULT_SRC="'self'"
CSP_SCRIPT_SRC="'self' 'unsafe-inline'"
CSP_STYLE_SRC="'self' 'unsafe-inline' https://fonts.googleapis.com"
CSP_FONT_SRC="'self' https://fonts.gstatic.com"
CSP_IMG_SRC="'self' data: https:"
CSP_CONNECT_SRC="'self'"

# Input Validation
MAX_REQUEST_SIZE=1mb                   # Strict size limit
MAX_FIELDS=20                         # Form field limit
MAX_FILE_SIZE=5mb                     # File upload limit
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
```

### 🔐 Secrets Generation

**Generate Secure Secrets:**
```bash
# JWT Secret (64 characters)
node -e "console.log('SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Database Password (32 characters)
node -e "console.log('DB_PASS=' + require('crypto').randomBytes(16).toString('base64'))"

# API Key (UUID format)
node -e "console.log('API_KEY=' + require('crypto').randomUUID())"

# Encryption Key (for sensitive data)
node -e "console.log('ENCRYPT_KEY=' + require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🏗️ Environment-Specific Setup

### 🛠️ Development Environment

**`.env.development`:**
```bash
NODE_ENV=development
DEBUG=gogotime:*

# Relaxed settings for development
API_PORT=4000
WEB_PORT=3000
DB_HOST=localhost
DB_SSL=false
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Development optimizations
CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true
VITE_SOURCEMAP=true
VITE_MINIFY=false

# Logging
LOG_LEVEL=debug
LOG_FORMAT=simple

# Quick iterations
JWT_EXPIRES_IN=86400                   # 24 hours
BCRYPT_ROUNDS=10                       # Faster hashing
```

**Development Docker Compose:**
```yaml
# App.Infra/docker-compose.dev.yml
services:
  api:
    environment:
      - NODE_ENV=development
      - DEBUG=gogotime:*
    volumes:
      - ../App.API:/app
      - api_node_modules:/app/node_modules
    command: yarn dev

  web:
    environment:
      - NODE_ENV=development
      - CHOKIDAR_USEPOLLING=true
    volumes:
      - ../App.Web:/app
      - web_node_modules:/app/node_modules
    command: yarn dev
```

### 🎭 Staging Environment

**`.env.staging`:**
```bash
NODE_ENV=staging

# Production-like settings
API_PORT=4000
WEB_PORT=3000
DB_SSL=true
CORS_ORIGIN=https://staging.yourdomain.com

# Security (production-like)
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=3600                    # 1 hour
RATE_LIMIT_MAX=100

# Monitoring enabled
ENABLE_METRICS=true
LOG_LEVEL=info
LOG_FORMAT=json

# Performance testing
VITE_SOURCEMAP=false
VITE_MINIFY=true
```

### 🚀 Production Environment

**`.env.production`:**
```bash
NODE_ENV=production

# Security hardened
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN=3600
SESSION_TIMEOUT=3600
RATE_LIMIT_MAX=50

# Database connection pooling
DB_SSL=true
DB_POOL_MIN=10
DB_POOL_MAX=50
DB_TIMEOUT=30000

# Performance optimized
VITE_SOURCEMAP=false
VITE_MINIFY=true
NODE_OPTIONS="--max-old-space-size=4096"

# Monitoring
LOG_LEVEL=error
LOG_FORMAT=json
ENABLE_METRICS=true

# Security headers
HSTS_MAX_AGE=63072000
CSP_DEFAULT_SRC="'self'"
```

---

## 🔐 Secrets Management

### 🗝️ Local Development

**For local development, use `.env` files:**
```bash
# Create environment file
cp .env.example .env.local

# Edit with your values
nano .env.local

# Load in application
source .env.local
```

### ☁️ Production Secrets

**AWS Secrets Manager:**
```typescript
// src/config/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

class SecretsManager {
  private client: SecretsManagerClient

  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-west-2'
    })
  }

  async getSecret(secretName: string): Promise<string> {
    try {
      const response = await this.client.send(
        new GetSecretValueCommand({
          SecretId: secretName,
          VersionStage: 'AWSCURRENT'
        })
      )
      return response.SecretString || ''
    } catch (error) {
      console.error(`Failed to retrieve secret ${secretName}:`, error)
      throw error
    }
  }

  async getDatabaseConfig() {
    const secrets = await this.getSecret('gogotime/database')
    return JSON.parse(secrets)
  }
}

export const secretsManager = new SecretsManager()
```

**Kubernetes Secrets:**
```yaml
# k8s-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: gogotime-secrets
  namespace: gogotime
type: Opaque
stringData:
  database-url: postgresql://user:pass@localhost:5432/gogotime
  jwt-secret: your-64-char-secret-here
  api-key: your-api-key-here
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gogotime-api
spec:
  template:
    spec:
      containers:
      - name: api
        image: gogotime-api:latest
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: gogotime-secrets
              key: database-url
        - name: SECRET
          valueFrom:
            secretKeyRef:
              name: gogotime-secrets
              key: jwt-secret
```

**HashiCorp Vault:**
```typescript
// src/config/vault.ts
import vault from 'node-vault'

class VaultClient {
  private client: any

  constructor() {
    this.client = vault({
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ENDPOINT || 'http://localhost:8200',
      token: process.env.VAULT_TOKEN
    })
  }

  async getSecret(path: string) {
    try {
      const response = await this.client.read(path)
      return response.data.data
    } catch (error) {
      console.error(`Failed to read secret from Vault: ${path}`, error)
      throw error
    }
  }

  async getDatabaseCredentials() {
    return await this.getSecret('secret/data/gogotime/database')
  }
}

export const vaultClient = new VaultClient()
```

---

## 📊 Monitoring Configuration

### 📈 Application Monitoring

**Prometheus Configuration:**
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

rule_files:
  - "alert-rules.yml"

scrape_configs:
  - job_name: 'gogotime-api'
    static_configs:
      - targets: ['api:4000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'gogotime-web'
    static_configs:
      - targets: ['web:3000']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

**Application Metrics:**
```typescript
// src/monitoring/metrics.ts
import promClient from 'prom-client'

// Create a Registry
const register = new promClient.Registry()

// Add default metrics
promClient.collectDefaultMetrics({
  register,
  prefix: 'gogotime_'
})

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'gogotime_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
})

const activeUsers = new promClient.Gauge({
  name: 'gogotime_active_users_total',
  help: 'Number of currently active users'
})

const dbConnections = new promClient.Gauge({
  name: 'gogotime_db_connections_active',
  help: 'Number of active database connections'
})

register.registerMetric(httpRequestDuration)
register.registerMetric(activeUsers)
register.registerMetric(dbConnections)

export { register, httpRequestDuration, activeUsers, dbConnections }
```

### 🚨 Alert Configuration

**Grafana Alerts:**
```yaml
# alerts/api-alerts.yml
groups:
  - name: gogotime-api
    rules:
      - alert: HighErrorRate
        expr: rate(gogotime_http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 10% for 2 minutes"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(gogotime_http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "95th percentile latency is above 1 second"

      - alert: DatabaseConnectionsHigh
        expr: gogotime_db_connections_active > 40
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Database connections high"
          description: "Active database connections: {{ $value }}"
```

---

## 🏷️ Tags

#configuration #environment #docker #kubernetes #secrets #security #monitoring #devops

**Related Documentation:**
- [[QUICK_START]] - Basic environment setup
- [[DEPLOYMENT_GUIDE]] - Production deployment
- [[SECURITY_MEASURES]] - Security configuration
- [[DEVELOPMENT_SETUP]] - Development environment

---

> [!WARNING] **Security Reminder**
> - Never commit secrets to version control
> - Use different secrets for each environment
> - Rotate secrets regularly
> - Limit secret access to necessary personnel only
> - Monitor secret usage and access

> [!NOTE] **Document Maintenance**
> **Last Updated:** {date}  
> **Version:** 1.0.0  
> **Maintainers:** DevOps Team (Lazaro, Alexy, Massi, Lounis)

**Need help with configuration?** Contact: devops@yourdomain.com
