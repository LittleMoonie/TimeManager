# 🏗️ GoGoTime Technical Overview

## 📋 Summary

GoGoTime is a monorepo containing a TypeScript API, a React/Vite frontend, Docker-based infrastructure, and this Docusaurus site. Our priority is delivering a cohesive feature set with strong typing and clear contributor workflows; large-scale orchestration and advanced telemetry are still on the roadmap.

## 🌐 Architecture at a Glance

| Layer        | Technology                                                                                     | Notes |
|--------------|-------------------------------------------------------------------------------------------------|-------|
| Backend      | Node.js 24, Express 5, TypeScript, TypeORM                                                      | Lives in `App.API`. Uses PostgreSQL, JWT auth, and TypeDI for dependency injection. |
| Frontend     | React 19, TypeScript, Material UI, TanStack Query, Vite                                         | Lives in `App.Web`. Consumes a generated OpenAPI client. |
| Data         | PostgreSQL 16 (Docker image `postgres:18-alpine`)                                               | Seed data and migrations housed in `App.API/Migrations` and `App.API/Seeds`. |
| Infrastructure | Docker Compose (`App.Infra/docker-compose.yml`)                                              | Spins up API, web, docs, Jenkins, Prometheus, Grafana, Adminer, and supporting exporters. |
| Documentation | Docusaurus (`App.Docusaurus/`)                                                                 | Markdown-driven docs, deployed manually today. |

## 🔗 How Components Interact

- The API exposes REST endpoints documented by TSOA. `yarn api:generate` rewrites `swagger.json`, and `yarn api:client` regenerates the frontend TypeScript SDK.  
- The frontend imports the generated client from `src/lib/api` and keeps session state via TanStack Query (`useAuth`).  
- Docker Compose wires the services together with environment variables via `App.Infra/.env`, enabling hot reload for API, web, and docs containers.  
- Prometheus, Grafana, node-exporter, and cAdvisor run alongside the app to provide basic container metrics. Logs stay in container stdout.

## 🎯 Engineering Principles

- **Type-first**: Enable strict TypeScript settings in both API and web projects.  
- **Single source of truth**: Treat DTOs/controllers as the canonical contract; regenerate OpenAPI artifacts after changes.  
- **Local reproducibility**: Compose stack must remain the fastest path to a working environment.  
- **Incremental hardening**: CI, caching, background jobs, and observability improvements ship only when code and tooling exist in-repo.

## 🛠️ Tooling Snapshot

- **Code quality**: ESLint (shared config), Prettier, Husky pre-commit hooks, TypeScript type checks.  
- **Testing**: Jest + Supertest (API), Vitest + Testing Library (web), Playwright (E2E). Suites are lightweight; contributors should extend them.  
- **Automation**: GitHub Actions builds docs; Jenkinsfile is available for manual CI on self-hosted agents.

## 🗺️ Roadmap Highlights

- Add Redis caching, message queues, and WebSocket support when needed (see `/docs/backend/cache-queues-realtime`).  
- Expand automated testing and enable CI checks on pull requests.  
- Introduce log aggregation, tracing, and alerting to complement the existing Prometheus/Grafana stack.  
- Consider packaging for cloud deployment (container registry pushes, infrastructure as code) once the manual Compose workflow is stable.

---

**SUMMARY**: GoGoTime combines a TypeScript Express API, a React/Vite frontend, and a Docker Compose stack that bundles database, observability, and documentation services. Automation and advanced platform features are intentionally light today, making the project approachable while leaving room for future enhancements.
