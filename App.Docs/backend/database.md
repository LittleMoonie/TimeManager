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
5. **Multi-tenancy**: Company-based data isolation

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

### Company Structure

```sql
-- Multi-tenant Company System
CREATE TABLE "Company" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(100) UNIQUE NOT NULL,
  "owner_id" UUID NOT NULL REFERENCES "User"("id"),
  "settings" JSONB DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3)
);

CREATE TABLE "CompanyMember" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "Company_id" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "role" "OrgRole" NOT NULL DEFAULT 'MEMBER',
  "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3),
  UNIQUE ("Company_id", "user_id")
);

CREATE TABLE "Team" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "Company_id" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
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
  "Company_id" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
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

## TypeORM Configuration

### Entity Definition

```typescript
// src/entities/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Session } from './Session';
import { ApiKey } from './ApiKey';
import { CompanyMember } from './CompanyMember';
import { Company } from './Company';
import { Task } from './Task';
import { AuditLog } from './AuditLog';
import { AccessLog } from './AccessLog';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  SYSTEM = 'SYSTEM',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

@Entity('User')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  role!: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  // Relations
  @OneToMany(() => Session, session => session.user)
  sessions!: Session[];

  @OneToMany(() => ApiKey, apiKey => apiKey.user)
  apiKeys!: ApiKey[];

  @OneToMany(() => CompanyMember, member => member.user)
  CompanyMembers!: CompanyMember[];

  @OneToMany(() => Company, Company => Company.owner)
  ownedCompanys!: Company[];

  @OneToMany(() => Task, task => task.assignee)
  assignedTasks!: Task[];

  @OneToMany(() => AuditLog, log => log.user)
  auditLogs!: AuditLog[];

  @OneToMany(() => AccessLog, log => log.user)
  accessLogs!: AccessLog[];

  // ... other relations as needed
}

// ... Additional entities
```

### Data Source Configuration

```typescript
// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Company } from './entities/Company';
// ... import other entities

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false, // Never use synchronize in production
  logging: ['error', 'warn'],
  entities: [User, Company /* ... other entities */],
  migrations: [],
  subscribers: [],
});

// Initialize data source
export const initializeDataSource = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
  }
};
```

## Migration Strategy

### Migration Workflow

```bash
# Development workflow
pnpm typeorm migration:run # Apply migrations
pnpm typeorm migration:generate -n MyMigration # Generate a new migration
pnpm typeorm migration:revert # Revert last migration
pnpm db:seed        # Seed development data
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
import { AppDataSource } from '../src/data-source';
import { execSync } from 'child_process';

async function migrate() {
  try {
    console.log('Running database migrations...');
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
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

-- Company queries
CREATE INDEX "Company_slug_idx" ON "Company"("slug") WHERE "deleted_at" IS NULL;
CREATE INDEX "Company_owner_id_idx" ON "Company"("owner_id");

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
CREATE INDEX "CompanyMember_org_user_idx" ON "CompanyMember"("Company_id", "user_id") WHERE "deleted_at" IS NULL;
```
\
### Query Optimization

```typescript
// Optimized queries with proper indexing
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entities/User';
import { CompanyMember } from '../src/entities/CompanyMember';
import { UserStatus } from '../src/entities/User';

export class UserService {
  async findUsersByCompany(orgId: string, options: {
    page?: number;
    limit?: number;
    status?: UserStatus;
  }) {
    const userRepository = AppDataSource.getRepository(User);
    return userRepository.find({
      where: {
        CompanyMembers: {
          CompanyId: orgId,
          deletedAt: null,
        },
        status: options.status,
        deletedAt: null,
      },
      skip: (options.page || 0) * (options.limit || 20),
      take: options.limit || 20,
      order: {
        createdAt: 'DESC',
      },
      relations: ['CompanyMembers'], // Eager load relations if needed
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
// src/seeds/initial.seed.ts
import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../entities/User';
import { Company } from '../entities/Company';
import { CompanyMember, OrgRole } from '../entities/CompanyMember';
import * as bcrypt from 'bcrypt';

export class InitialSeed {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const CompanyRepository = dataSource.getRepository(Company);
    const CompanyMemberRepository = dataSource.getRepository(CompanyMember);

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = userRepository.create({
      email: 'admin@ncy-8.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });
    await userRepository.save(admin);

    // Create test Company
    const Company = CompanyRepository.create({
      name: 'Test Company',
      slug: 'test-org',
      owner: admin,
    });
    await CompanyRepository.save(Company);

    // Create test users
    const managerUser = userRepository.create({
      email: 'manager@test-org.com',
      passwordHash: await bcrypt.hash('manager123', 12),
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
    });
    await userRepository.save(managerUser);

    const employeeUser = userRepository.create({
      email: 'employee@test-org.com',
      passwordHash: await bcrypt.hash('employee123', 12),
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
    });
    await userRepository.save(employeeUser);

    // Add users to Company
    const managerMember = CompanyMemberRepository.create({
      Company: Company,
      user: managerUser,
      role: OrgRole.MANAGER,
    });
    await CompanyMemberRepository.save(managerMember);

    const employeeMember = CompanyMemberRepository.create({
      Company: Company,
      user: employeeUser,
      role: OrgRole.MEMBER,
    });
    await CompanyMemberRepository.save(employeeMember);

    console.log('Seed data created successfully');
  }
}
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
import { AppDataSource } from '../src/data-source';

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
  if (AppDataSource.isInitialized) {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      const result = await queryRunner.query(
        `SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active'`
      );
      dbConnections.set(Number(result[0].active_connections));
    } finally {
      await queryRunner.release();
    }
  }
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
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entities/User';
import { GdprRequest } from '../src/entities/GdprRequest';
import { GdprRequestType, GdprRequestStatus } from '../src/entities/GdprRequest';

export class GdprService {
  async exportUserData(userId: string) {
    const userRepository = AppDataSource.getRepository(User);
    const gdprRequestRepository = AppDataSource.getRepository(GdprRequest);

    const userData = await userRepository.findOne({
      where: { id: userId },
      relations: ['CompanyMembers.Company', 'auditLogs', 'accessLogs'],
    });

    // Create export request
    const exportRequest = gdprRequestRepository.create({
      userId,
      type: GdprRequestType.EXPORT,
      status: GdprRequestStatus.PENDING,
    });
    await gdprRequestRepository.save(exportRequest);

    return userData;
  }

  async deleteUserData(userId: string) {
    const userRepository = AppDataSource.getRepository(User);
    const gdprRequestRepository = AppDataSource.getRepository(GdprRequest);

    // Soft delete user data
    await userRepository.update({ id: userId }, { deletedAt: new Date() });

    // Log deletion request
    const deleteRequest = gdprRequestRepository.create({
      userId,
      type: GdprRequestType.DELETE,
      status: GdprRequestStatus.PENDING,
    });
    await gdprRequestRepository.save(deleteRequest);
  }
}
```

---

*This database strategy ensures data integrity, performance, and compliance while providing a solid foundation for the NCY_8 platform.*
