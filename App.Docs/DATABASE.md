# Database Strategy & Operations

## Overview

This document outlines the database strategy for the NCY_8 platform, including schema design, migration management, performance optimization, backup procedures, and compliance requirements.

## Database Architecture

### Technology Stack

- **Database**: PostgreSQL 15+
- **ORM**: TypeORM 0.3+
- **Connection Pooling**: Built-in PostgreSQL driver
- **Backup**: pg_dump with point-in-time recovery
- **Monitoring**: postgres_exporter + Prometheus

### Database Design Principles

1. **Normalization**: Third normal form with strategic denormalization
2. **UUID Primary Keys**: Better distribution and security
3. **Soft Deletes**: Audit trails and data recovery
4. **Audit Logging**: Comprehensive change tracking
5. **Multi-tenancy**: Organization-based data isolation

## Schema Design

### Core Identity Tables

```sql
-- Users and Authentication
CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3)
);

CREATE TABLE "Session" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "refresh_token" VARCHAR(255) NOT NULL,
  "ip_address" INET,
  "user_agent" TEXT,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ApiKey" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key_hash" VARCHAR(255) NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "scopes" TEXT[] NOT NULL DEFAULT '{}',
  "last_used_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### RBAC System

```sql
-- Role-Based Access Control
CREATE TABLE "Role" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) UNIQUE NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Permission" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" VARCHAR(100) UNIQUE NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "RolePermission" (
  "role_id" UUID NOT NULL REFERENCES "Role"("id") ON DELETE CASCADE,
  "permission_id" UUID NOT NULL REFERENCES "Permission"("id") ON DELETE CASCADE,
  PRIMARY KEY ("role_id", "permission_id")
);

CREATE TABLE "UserRoleMap" (
  "user_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "role_id" UUID NOT NULL REFERENCES "Role"("id") ON DELETE CASCADE,
  "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "granted_by" UUID REFERENCES "User"("id"),
  PRIMARY KEY ("user_id", "role_id")
);
```

### Organization Structure

```sql
-- Multi-tenant Organization System
CREATE TABLE "Organization" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(100) UNIQUE NOT NULL,
  "owner_id" UUID NOT NULL REFERENCES "User"("id"),
  "settings" JSONB DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3)
);

CREATE TABLE "OrganizationMember" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "role" "OrgRole" NOT NULL DEFAULT 'MEMBER',
  "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3),
  UNIQUE ("organization_id", "user_id")
);

CREATE TABLE "Team" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3)
);

CREATE TABLE "TeamMember" (
  "team_id" UUID NOT NULL REFERENCES "Team"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3),
  PRIMARY KEY ("team_id", "user_id")
);
```

### Business Entities

```sql
-- Project Management
CREATE TABLE "Project" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
  "settings" JSONB DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3)
);

CREATE TABLE "Task" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "assignee_id" UUID REFERENCES "User"("id"),
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
  "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
  "due_date" TIMESTAMP(3),
  "metadata" JSONB DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3)
);
```

### Audit & Logging Tables

```sql
-- Comprehensive Audit System
CREATE TABLE "AuditLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "User"("id"),
  "action" VARCHAR(100) NOT NULL,
  "target_table" VARCHAR(100) NOT NULL,
  "target_id" UUID,
  "old_value" JSONB,
  "new_value" JSONB,
  "ip_address" INET,
  "user_agent" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ErrorLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "service" VARCHAR(100) NOT NULL,
  "level" "LogLevel" NOT NULL,
  "message" TEXT NOT NULL,
  "stack" TEXT,
  "context" JSONB DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AccessLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "User"("id"),
  "method" VARCHAR(10) NOT NULL,
  "endpoint" VARCHAR(255) NOT NULL,
  "status_code" INTEGER NOT NULL,
  "latency_ms" INTEGER,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Prisma Configuration

### Schema Definition

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  MANAGER
  EMPLOYEE
  SYSTEM
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING
}

enum OrgRole {
  OWNER
  ADMIN
  MANAGER
  MEMBER
}

enum ProjectStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
  CANCELLED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum LogLevel {
  DEBUG
  INFO
  WARN
  ERROR
  FATAL
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String    @map("password_hash")
  role         UserRole  @default(EMPLOYEE)
  status       UserStatus @default(ACTIVE)
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")

  // Relations
  sessions           Session[]
  apiKeys           ApiKey[]
  organizationMembers OrganizationMember[]
  teamMembers       TeamMember[]
  ownedOrganizations Organization[] @relation("OrganizationOwner")
  assignedTasks     Task[]
  auditLogs         AuditLog[]
  accessLogs        AccessLog[]
  notifications     Notification[]
  files             File[]
  sentMessages      Message[] @relation("MessageSender")
  receivedMessages  Message[] @relation("MessageReceiver")
  settings          Settings[]
  userRoles         UserRoleMap[]
  gdprRequests      GdprRequest[]
  consents          Consent[]

  @@map("User")
}

model Organization {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  ownerId   String   @map("owner_id")
  settings  Json     @default("{}")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  // Relations
  owner      User                 @relation("OrganizationOwner", fields: [ownerId], references: [id])
  members    OrganizationMember[]
  teams      Team[]
  projects   Project[]
  auditLogs  AuditLog[]

  @@map("Organization")
}

// ... Additional models
```

### Client Configuration

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Connection pooling configuration
export const prismaWithPool = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=20',
    },
  },
});
```

## Migration Strategy

### Migration Workflow

```bash
# Development workflow
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Apply migrations
pnpm db:seed        # Seed development data
pnpm db:reset       # Reset database (development only)
```

### Migration Best Practices

1. **Atomic Migrations**: Each migration should be atomic
2. **Backward Compatibility**: Avoid breaking changes in migrations
3. **Data Migrations**: Separate schema and data migrations
4. **Rollback Strategy**: Always provide rollback migrations
5. **Testing**: Test migrations on production-like data

### Migration Example

```sql
-- Migration: 20240115000000_add_user_preferences.sql
-- Add user preferences table

CREATE TABLE "UserPreferences" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "preferences" JSONB DEFAULT '{}',
  "timezone" VARCHAR(50) DEFAULT 'UTC',
  "locale" VARCHAR(10) DEFAULT 'en',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "UserPreferences_user_id_idx" ON "UserPreferences"("user_id");
```

### Migration Scripts

```typescript
// scripts/migrate.ts
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('Running database migrations...');
    
    // Generate Prisma client
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Apply migrations
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
```

## Indexing Strategy

### Performance Indexes

```sql
-- User queries
CREATE INDEX "User_email_idx" ON "User"("email") WHERE "deleted_at" IS NULL;
CREATE INDEX "User_status_idx" ON "User"("status") WHERE "deleted_at" IS NULL;
CREATE INDEX "User_created_at_idx" ON "User"("created_at");

-- Organization queries
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug") WHERE "deleted_at" IS NULL;
CREATE INDEX "Organization_owner_id_idx" ON "Organization"("owner_id");

-- Task queries
CREATE INDEX "Task_project_id_idx" ON "Task"("project_id") WHERE "deleted_at" IS NULL;
CREATE INDEX "Task_assignee_id_idx" ON "Task"("assignee_id") WHERE "deleted_at" IS NULL;
CREATE INDEX "Task_status_idx" ON "Task"("status") WHERE "deleted_at" IS NULL;
CREATE INDEX "Task_due_date_idx" ON "Task"("due_date") WHERE "deleted_at" IS NULL;

-- Audit queries
CREATE INDEX "AuditLog_user_id_idx" ON "AuditLog"("user_id");
CREATE INDEX "AuditLog_target_table_target_id_idx" ON "AuditLog"("target_table", "target_id");
CREATE INDEX "AuditLog_created_at_idx" ON "AuditLog"("created_at");

-- Composite indexes for common queries
CREATE INDEX "Task_project_status_idx" ON "Task"("project_id", "status") WHERE "deleted_at" IS NULL;
CREATE INDEX "OrganizationMember_org_user_idx" ON "OrganizationMember"("organization_id", "user_id") WHERE "deleted_at" IS NULL;
```
\
### Query Optimization

```typescript
// Optimized queries with proper indexing
export class UserService {
  async findUsersByOrganization(orgId: string, options: {
    page?: number;
    limit?: number;
    status?: UserStatus;
  }) {
    return prisma.user.findMany({
      where: {
        organizationMembers: {
          some: {
            organizationId: orgId,
            deletedAt: null,
          },
        },
        status: options.status,
        deletedAt: null,
      },
      include: {
        organizationMembers: {
          where: {
            organizationId: orgId,
            deletedAt: null,
          },
        },
      },
      skip: (options.page || 0) * (options.limit || 20),
      take: options.limit || 20,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
```

## Backup & Recovery

### Backup Strategy

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="ncy8_production"

# Create backup directory
mkdir -p $BACKUP_DIR

# Full database backup
pg_dump -h localhost -U postgres -d $DB_NAME \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/ncy8_${DATE}.dump"

# Backup verification
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: ncy8_${DATE}.dump"
  
  # Log backup in database
  psql -h localhost -U postgres -d $DB_NAME -c "
    INSERT INTO \"BackupSnapshot\" (path, size, verified, created_at)
    VALUES ('$BACKUP_DIR/ncy8_${DATE}.dump', 
            $(stat -c%s "$BACKUP_DIR/ncy8_${DATE}.dump"), 
            true, 
            NOW());
  "
else
  echo "Backup failed!"
  exit 1
fi

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "ncy8_*.dump" -mtime +30 -delete
```

### Point-in-Time Recovery (PITR)

```bash
# PITR Configuration
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'
max_wal_senders = 3
wal_keep_size = 1GB

# Recovery script
#!/bin/bash
# scripts/restore.sh

BACKUP_FILE=$1
TARGET_TIME=$2

if [ -z "$BACKUP_FILE" ] || [ -z "$TARGET_TIME" ]; then
  echo "Usage: $0 <backup_file> <target_time>"
  echo "Example: $0 ncy8_20240115_120000.dump '2024-01-15 12:30:00'"
  exit 1
fi

# Stop PostgreSQL
systemctl stop postgresql

# Restore from backup
pg_restore -h localhost -U postgres -d ncy8_production -c $BACKUP_FILE

# Configure PITR
cat > /var/lib/postgresql/data/recovery.conf << EOF
restore_command = 'cp /var/lib/postgresql/wal_archive/%f %p'
recovery_target_time = '$TARGET_TIME'
EOF

# Start PostgreSQL
systemctl start postgresql
```

## Data Seeding

### Development Seeds

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ncy-8.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Create test organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Test Organization',
      slug: 'test-org',
      ownerId: admin.id,
    },
  });

  // Create test users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'manager@test-org.com',
        passwordHash: await bcrypt.hash('manager123', 12),
        role: 'MANAGER',
        status: 'ACTIVE',
      },
    }),
    prisma.user.create({
      data: {
        email: 'employee@test-org.com',
        passwordHash: await bcrypt.hash('employee123', 12),
        role: 'EMPLOYEE',
        status: 'ACTIVE',
      },
    }),
  ]);

  // Add users to organization
  await Promise.all([
    prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: users[0].id,
        role: 'MANAGER',
      },
    }),
    prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: users[1].id,
        role: 'MEMBER',
      },
    }),
  ]);

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Performance Monitoring

### Query Performance

```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
SELECT pg_reload_conf();

-- Query performance analysis
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### Database Metrics

```typescript
// Database monitoring
import { prometheus } from 'prom-client';

const dbConnections = new prometheus.Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
});

const queryDuration = new prometheus.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Database query duration',
  labelNames: ['query_type'],
});

// Monitor connection pool
setInterval(async () => {
  const result = await prisma.$queryRaw`
    SELECT count(*) as active_connections 
    FROM pg_stat_activity 
    WHERE state = 'active'
  `;
  dbConnections.set(Number(result[0].active_connections));
}, 5000);
```

## GDPR Compliance

### Data Retention

```sql
-- Data retention policies
CREATE POLICY "user_data_retention" ON "User"
  FOR DELETE
  USING (
    deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '7 years'
  );

-- Anonymization function
CREATE OR REPLACE FUNCTION anonymize_user_data(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE "User" 
  SET 
    email = 'anonymized_' || user_id || '@deleted.com',
    password_hash = 'anonymized',
    deleted_at = NOW()
  WHERE id = user_id;
  
  -- Log anonymization
  INSERT INTO "AuditLog" (user_id, action, target_table, target_id, new_value)
  VALUES (user_id, 'ANONYMIZE', 'User', user_id, '{"anonymized": true}');
END;
$$ LANGUAGE plpgsql;
```

### Data Export

```typescript
// GDPR data export
export class GdprService {
  async exportUserData(userId: string) {
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizationMembers: {
          include: {
            organization: true,
          },
        },
        auditLogs: true,
        accessLogs: true,
      },
    });

    // Create export request
    await prisma.gdprRequest.create({
      data: {
        userId,
        type: 'EXPORT',
        status: 'PENDING',
      },
    });

    return userData;
  }

  async deleteUserData(userId: string) {
    // Soft delete user data
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    // Log deletion request
    await prisma.gdprRequest.create({
      data: {
        userId,
        type: 'DELETE',
        status: 'PENDING',
      },
    });
  }
}
```

---

*This database strategy ensures data integrity, performance, and compliance while providing a solid foundation for the NCY_8 platform.*
