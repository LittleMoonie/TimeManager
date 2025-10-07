# NCY_8 Project Architecture

## Current Structure Analysis

**Existing:**
- ✅ Next.js frontend with Tailwind CSS
- ✅ Documentation in `/docs`
- ❌ No backend API
- ❌ No shared packages
- ❌ No database setup
- ❌ No monorepo workspace configuration

## Target Monorepo Structure

```
ncy-8/
├── apps/
│   ├── web/                    # Next.js frontend (rename from 'front')
│   ├── api/                    # Express backend
│   ├── worker/                 # BullMQ job processor
│   └── docs/                   # Docusaurus documentation
├── packages/
│   ├── config/                 # Shared ESLint, Prettier, TSConfig
│   ├── ui/                     # Shared React components
│   ├── types/                  # Shared TypeScript types & Zod schemas
│   ├── utils/                  # Shared utilities
│   └── database/               # Prisma schema & migrations
├── infrastructure/
│   ├── docker/                 # Docker configurations
│   ├── nginx/                  # Nginx configs
│   └── k8s/                    # Kubernetes manifests
├── scripts/                    # Build & deployment scripts
├── .github/
│   └── workflows/              # GitHub Actions
├── docker-compose.yml          # Local development
├── pnpm-workspace.yaml         # pnpm workspace config
└── package.json                # Root package.json
```

## Migration Plan

### Phase 1: Restructure Existing Code
1. Move `front/` → `apps/web/`
2. Create `apps/api/` for Express backend
3. Set up pnpm workspaces
4. Create shared packages

### Phase 2: Add Missing Components
1. Database schema with Prisma
2. Backend services and API
3. Shared packages for types and utils
4. Docker configuration

### Phase 3: Infrastructure & CI/CD
1. Docker Compose setup
2. GitHub Actions workflows
3. Nginx reverse proxy
4. Monitoring and logging

## Database Schema Overview

```prisma
// Core Models
User (id: UUID, email: unique, password_hash, role: enum, created_at, updated_at)
Session (id, user_id: FK, refresh_token, expires_at)
Organization (id, name, owner_id: FK User)
OrganizationMember (id, organization_id: FK, user_id: FK, role)

// Audit & Logging
AuditLog (id, user_id: FK, action, target_table, target_id, old_value, new_value, created_at)
ErrorLog (id, service, level: enum, message, stack, context: JSON, created_at)
JobLog (id, job_name, status: enum, attempts, payload: JSON, created_at)

// Security & API
ApiKey (id, key_hash, user_id: FK, scopes: string[], last_used_at)
LoginAttempt (id, email, ip_address, success: bool, created_at)

// Business Logic
Project (id, organization_id: FK, name, description, status)
Task (id, project_id: FK, assignee_id: FK User, title, description, status, due_date)

// System
Notification (id, user_id: FK, type, message, read, created_at)
File (id, user_id: FK, url, mime_type, size, created_at)
Settings (id, user_id: FK, preferences: JSON, timezone, locale)
```

## Technology Stack

### Frontend (apps/web)
- Next.js 15+ with App Router
- Javascript
- Material-UI (MUI) v5
- Tailwind CSS (keep existing)
- Zustand for state management

### Backend (apps/api)
- Node.js 18+ with Express
- Javascript
- Prisma ORM with PostgreSQL
- Redis for caching and sessions
- BullMQ for job processing
- JWT for authentication

### Shared Packages
- `@ncy-8/types`: Zod schemas and TypeScript types
- `@ncy-8/ui`: Shared React components
- `@ncy-8/utils`: Common utilities
- `@ncy-8/config`: ESLint, Prettier, TSConfig

### Infrastructure
- Docker & Docker Compose
- Nginx reverse proxy
- PostgreSQL 15+
- Redis 7+
- GitHub Actions for CI/CD

## Next Steps

1. **Restructure existing code** into monorepo format
2. **Create backend API** with Express and Prisma
3. **Set up shared packages** for types and utilities
4. **Configure Docker** for local development
5. **Add CI/CD pipelines** with GitHub Actions

This architecture provides a scalable, maintainable foundation for the NCY_8 platform while preserving the existing frontend code.
