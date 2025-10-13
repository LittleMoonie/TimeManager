# 🚀 Getting Started with GoGoTime

Welcome to GoGoTime! This guide will get you up and running with the development environment in minutes.

## 🎯 Prerequisites

Before starting, ensure you have:

- **Node.js** and **Yarn** (refer to the root `.nvmrc` and `.yarnrc.yml` for specific versions)
- **Docker** and **Docker Compose**
- **Git** for version control

## 📋 Quick Setup (5 minutes)

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd T-DEV-700-project-NCY_8
```

### 2. Start with Docker (Recommended)

```bash
# Start all services (database, API, web)
cd App.Infra
docker compose up --build --watch

# That's it! 🎉
```

**Services will be available at:**

- 🌐 **Web App**: http://localhost:3000
- 🔌 **API**: http://localhost:4000
- 📖 **API Docs**: http://localhost:4000/api/docs
- 🗄️ **Database**: localhost:5432

### 3. Verify Everything Works

```bash
# Check API health
curl http://localhost:4000/api/system/health

# View interactive API documentation
open http://localhost:4000/api/docs

# Check web app
open http://localhost:3000
```

## 🛠️ Development Workflow

### API Development

```bash
# Make changes to controllers/DTOs in App.API/src/
# OpenAPI docs auto-generate when server is healthy!

# Manual generation (if needed)
cd App.API
yarn api:sync  # Generates OpenAPI spec + frontend client

# Check the docs
open http://localhost:4000/api/docs
```

### Frontend Development

```bash
# The frontend automatically gets updated type-safe API client
# Location: App.Web/src/lib/api/client.ts

# Use the generated client:
import { apiClient } from '@/lib/api/apiClient';
import { LoginDto } from "../../App.API/Dtos/Authentication/AuthenticationDto";

const loginData: LoginDto = { email: '...', password: '...' };
const result = await apiClient.authenticationLogin(loginData);
```

## 📚 Key Features You Should Know

### ✨ Auto-Generated API Documentation

- **What**: OpenAPI specs generated from TypeScript code
- **Where**: http://localhost:4000/api/docs
- **When**: Automatically when server starts and detects changes
- **How**: Uses tsoa decorators on controllers

### 🔄 Hot Reloading

- **Backend**: Code changes automatically reload the API
- **Frontend**: Vite hot reload for instant UI updates
- **Docker**: Watch mode syncs file changes to containers

### 🎯 Type Safety

- **API Contracts**: TypeScript DTOs define request/response shapes
- **Frontend Client**: Auto-generated, type-safe API client
- **Validation**: Runtime validation with `class-validator` on DTOs

## 🗂️ Project Structure Overview

```
GoGoTime/
├── App.API/           # 🔌 Express.js + TypeORM backend
│   ├── src/controllers/   # API endpoints with tsoa decorators
│   ├── src/Dtos/          # TypeScript data transfer objects
│   └── swagger.json      # ✨ Auto-generated OpenAPI spec
├── App.Web/           # ⚛️ React 19 + Vite frontend
│   └── src/lib/api/      # ✨ Auto-generated API client
├── App.Infra/         # 🐳 Docker infrastructure
│   └── docker-compose.yml
└── App.Docs/              # 📚 This documentation
```

## 🔧 Essential Commands

### Development

```bash
# Start everything with hot reload
cd App.Infra && docker compose up --watch

# Stop everything
docker compose down

# View logs
docker compose logs -f api    # API logs
docker compose logs -f web    # Frontend logs
```

### API Documentation

```bash
# Generate OpenAPI spec + frontend client
cd App.API && yarn api:sync

# Generate only OpenAPI spec
cd App.API && yarn api:generate

# Force regeneration via API
curl -X POST "http://localhost:4000/api/system/generate-openapi?frontend=true"
```

### Database

```bash
# Access database directly
docker exec -it gogotime-db psql -U postgres -d gogotime_dev

# View database logs
docker compose logs db
```

## 🚨 Common Issues & Solutions

### "Port already in use"

```bash
# Find what's using the port
lsof -i :4000  # or :3000, :5432

# Kill the process or stop other docker containers
docker compose down
```

### "Database connection error"

```bash
# Ensure database is running and healthy
docker compose ps
docker compose logs db

# Restart database if needed
docker compose restart db
```

### "OpenAPI spec not found"

```bash
# Generate it manually
cd App.API && yarn api:generate

# Or via API endpoint
curl -X POST "http://localhost:4000/api/system/generate-openapi"
```

### "Environment variables missing"

```bash
# Ensure .env file exists in project root
ls -la .env

# Check Docker Compose loads it
docker compose config
```

## 📖 Next Steps

1. **Explore the API**: Visit http://localhost:4000/api/docs
2. **Read Architecture**: [`../backend/architecture.md`](../backend/architecture.md)
3. **API Development**: [`../api/openapi-automation.md`](../api/openapi-automation.md)
4. **Database Setup**: [`../backend/database.md`](../backend/database.md)
5. **Testing**: [`../development/testing.md`](../development/testing.md)

## 🤝 Need Help?

- **Troubleshooting**: [`troubleshooting.md`](./troubleshooting.md)
- **API Questions**: Use interactive docs at `/api/docs`
- **Architecture**: [`../backend/architecture.md`](../backend/architecture.md)
- **Development Process**: [`../development/`](../development/)

---

**🎉 You're all set! Happy coding!**
