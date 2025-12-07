# 🚀 Getting Started with GoGoTime

## 📋 Overview

Welcome! This short guide shows how to run the stack locally, which tooling to install, and where each app lives.

## 🎯 Prerequisites

- **Node.js 24.9+ and Yarn 4** – check the `engines` field in the root `package.json`. Run `corepack enable` to use Yarn 4.
- **Docker Desktop or Docker Engine** with Compose v2 – the easiest way to boot API, web, database, docs, and observability.
- **Git** – clone the repository and manage branches.
- (Optional) **pnpm/nvm** – although `App.API/.nvmrc` exists, Node 24 works fine across projects.

## ⚡ Quick Start (Recommended)

```bash
git clone <repo-url>
cd T-DEV-700-project-NCY_8/App.Infra
cp .env.example .env        # update secrets if needed
docker compose up --build --watch
```

Hot reload is enabled for API and web containers. Defaults expose:

- Web app: `http://localhost:3000`
- API + Swagger UI: `http://localhost:4000` / `http://localhost:4000/api/docs`

Opt-in services:

- Adminer (`--profile devtools`): `http://localhost:8081`
- Observability (`--profile monitoring`): Grafana at `http://localhost:3001` plus Prometheus/node-exporter/cAdvisor
- Jenkins (`--profile ci`): `http://localhost:8080`
- Docs (`--profile docs`): `http://localhost:3002`

Stop the stack with `docker compose down`.

## 🔧 Local-Only Development

Prefer running inside containers, but you can work directly on your host:

```bash
# API
cd App.API
yarn install
yarn dev          # launches ts-node-dev at http://localhost:4000

# Web
cd ../App.Web
yarn install
yarn dev          # launches Vite at http://localhost:5173 (proxy API at :4000)
```

Remember to set up a Postgres instance (Docker or local) and copy `.env.example` to `.env` for both API and Infra if you go this route.

## 📚 Project Map

- `App.API/` – Express + TypeORM backend (controllers, services, DTOs, seeds, migrations).
- `App.Web/` – Vite + React frontend with generated OpenAPI client.
- `App.Infra/` – Docker Compose stack, Prometheus/Grafana setup, Jenkins container.
- `App.Docusaurus/` – documentation site you are reading.

## 🛠️ Developer Workflow

1. Make code changes in `App.API` or `App.Web`.
2. Run `yarn lint`, `yarn typecheck`, and the relevant test commands (see [Testing](/docs/devops/testing)).
3. Regenerate OpenAPI when modifying API routes or DTOs:
   ```bash
   cd App.API && yarn api:generate
   cd ../App.Web && yarn api:client
   ```
4. Update docs in `App.Docusaurus` if behaviour changes.

## 🆘 Common Issues

- **Ports busy** → stop existing services or change values in `App.Infra/.env`.
- **JWT errors** → set `JWT_SECRET` in your `.env`.
- **Database connection refused** → ensure the `db` service is healthy; run `docker compose ps` or check Adminer.
- **Swagger not updated** → rerun `yarn api:generate` and restart the API container.

## 🛣️ Future Improvements

- Provide a bootstrap script to copy `.env` files, install dependencies, and start Compose automatically.
- Publish prebuilt Docker images to speed up initial `docker compose up`.
- Add onboarding checklists (lint, tests, type checks) to the repository README and CI.
- Ship seed data snapshots for common demo scenarios (multiple companies, rich timesheets).

---

**SUMMARY**: Install Node 24+, Yarn 4, and Docker; run `docker compose up --build --watch` from `App.Infra` to launch the core stack, adding profiles for Adminer/monitoring/Jenkins/docs as needed; use Yarn scripts for development, testing, and OpenAPI generation; update documentation alongside code changes.
