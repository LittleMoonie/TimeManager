# 🗄️ Database Strategy & Operations

## 📋 Overview

GoGoTime stores all persistent data in PostgreSQL through TypeORM. This page explains how the schema is organised, how migrations and seeds work, and the operational practices we follow today. Backup automation and advanced compliance processes are not yet implemented; treat the guidance below as the current baseline.

## 🏗️ Technology Stack

- **PostgreSQL** – runs in Docker via `postgres:18-alpine`, configured in `App.Infra/docker-compose.yml`.  
- **TypeORM 0.3** – entities live under `App.API/Entities`, repositories under `App.API/Repositories`.  
- **TypeDI** – injects repositories/services for testability.  
- **UUID primary keys** – provided by the shared `BaseEntity`.

## 🧱 Schema Conventions

- **Company scoped data**: Most tables include `companyId` to support multi-tenant RBAC and reporting.  
- **Soft deletes**: `BaseEntity` defines `deletedAt`, enabling soft-deletion through `withDeleted` queries.  
- **Auditing columns**: `createdByUserId` and `updatedByUserId` exist but must be populated explicitly by services.

Refer to `App.API/Entities/…` for concrete fields (e.g., `Users/User.ts`, `Timesheets/Timesheet.ts`).

## 🔄 Migrations & Seeds

- Generate migrations with `yarn migrate:generate` after updating entities.  
- Apply migrations using `yarn migrate:up`; rollback with `yarn migrate:down`.  
- Seed data exists in `App.API/Seeds` (company, roles/permissions, default users). Run `yarn seed` to populate a new database.  
- Keep migrations idempotent and avoid destructive changes without a corresponding data migration plan.

## 🧪 Local Development Tips

1. Start the database through Docker Compose (`cd App.Infra && docker compose up`).  
2. Connect via Adminer (`http://localhost:8081`) or `docker compose exec db psql -U <user> <db>`.  
3. Reset the database by dropping volumes: `docker compose down -v` (only in development). Then rerun migrations and seeds.

## 📦 Backups & Production Operations

Automated backups and point-in-time recovery are not included in this repository. When deploying to production:

- Schedule `pg_dump` exports or use your cloud provider’s managed backup features.  
- Store secrets (`DB_USER`, `DB_PASS`, `DB_NAME`) securely outside version control.  
- Implement monitoring (connection count, slow queries) using tools available in your hosting environment or extend the Prometheus stack.

## 🗺️ Roadmap

- Add migration tests to CI to catch breaking changes.  
- Provide seed fixtures tailored for automated API testing.  
- Document a standard backup/restore process once production hosting is defined.

---

**SUMMARY**: PostgreSQL and TypeORM provide the persistence layer. Migrations and seeds are managed through Yarn scripts, with Docker Compose offering the fastest local setup. Production backups and advanced auditing are pending future work, so plan them explicitly for any live deployment.
