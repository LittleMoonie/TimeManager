# 🚀 GoGoTime - Modern Full-Stack Application

[![CI/CD](https://github.com/your-org/gogotime/workflows/CI/badge.svg)](https://github.com/your-org/gogotime/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24.9+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

## 🌟 Overview

GoGoTime is a modern, full-stack application built with **TypeScript-first** approach, featuring automatic API documentation generation, type-safe frontend-backend communication, and a comprehensive Docker-based development environment.

### ✨ Key Features

- **🔄 Auto-Generated API Documentation** - OpenAPI specs generated directly from TypeScript code
- **⚡ Type-Safe API Client** - Auto-generated frontend SDK with full TypeScript support  
- **🐳 Docker-First Development** - Complete containerized environment with hot reloading
- **🔒 Secure Authentication** - JWT-based auth with session management
- **📊 Interactive API Docs** - Live Swagger UI for API exploration and testing
- **🎯 Modern Stack** - React 19, Express.js, TypeORM, and PostgreSQL
- **⚙️ Smart Auto-Generation** - Detects changes and updates docs when API is healthy

## 🛠️ Technology Stack

### 🎨 Frontend (`App.Web`)
- **Framework**: React 19.2.0 with Vite
- **Language**: TypeScript 5.9+
- **UI Library**: Material-UI (MUI) v7
- **State Management**: Redux Toolkit + React Redux
- **Build Tool**: Vite 7+ with hot reload
- **Testing**: Vitest + React Testing Library

### ⚙️ Backend (`App.API`)
- **Runtime**: Node.js 24.9+
- **Framework**: Express.js 4+ with TypeScript
- **Database**: PostgreSQL 18 with TypeORM 0.3+
- **Documentation**: **tsoa** for OpenAPI auto-generation
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Joi schemas for request validation
- **Process Manager**: PM2 for production

### 🐳 Infrastructure (`App.Infra`)
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose with watch mode
- **Database**: PostgreSQL 18-alpine
- **Development**: Hot reloading and file sync
- **Production**: Optimized builds with health checks

### 📚 Documentation (`App.Docs/`)
- **Organized Structure**: API, Backend, Frontend, Infrastructure, Guides
- **Auto-Generated**: OpenAPI specs from code annotations
- **Interactive**: Swagger UI at `/api/docs`
- **Comprehensive**: Setup, troubleshooting, and deployment guides

## 🚀 Quick Start (2 minutes)

### Prerequisites
- **Docker** and **Docker Compose** (recommended)
- **Node.js 24.9+** and **Yarn 4.10.3+** (for local development)
- **Git** for version control

### 🐳 Docker Setup (Recommended)
   ```bash
# 1. Clone and navigate
git clone <repository-url>
cd T-DEV-700-project-NCY_8

# 2. Start all services with hot reloading
cd App.Infra
docker compose up --build --watch

# 3. That's it! 🎉
```

**🌐 Access Your Application:**
- **Web App**: http://localhost:3000
- **API Server**: http://localhost:4000  
- **📖 API Documentation**: http://localhost:4000/api/docs ✨
- **Database**: localhost:5432

### ⚡ Local Development (Alternative)
   ```bash
# 1. Start database only
cd App.Infra && docker compose up -d db

# 2. Start API (auto-generates OpenAPI docs)
cd App.API && yarn dev

# 3. Start frontend (auto-generates API client)  
cd App.Web && yarn dev
```

## 🏗️ Project Structure

```
GoGoTime/
├── 📁 App.API/                  # 🔌 Express.js + TypeORM Backend
│   ├── src/
│   │   ├── controllers/         # 🎯 API endpoints with tsoa decorators
│   │   ├── dto/                 # 📋 TypeScript data transfer objects
│   │   ├── models/              # 🗄️ TypeORM database entities
│   │   ├── services/            # ⚙️ Business logic services
│   │   └── routes/generated/    # ✨ Auto-generated tsoa routes
│   ├── swagger.json             # ✨ Auto-generated OpenAPI spec
│   └── tsoa.json                # 🔧 OpenAPI generation config
│
├── 📁 App.Web/                  # ⚛️ React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/          # 🧩 React components
│   │   ├── features/            # 📦 Feature-based modules
│   │   ├── lib/api/             # ✨ Auto-generated API client
│   │   │   ├── client.ts        # 📡 Generated TypeScript types
│   │   │   └── apiClient.ts     # 🛠️ Utility wrapper with error handling
│   │   └── types/               # 🏷️ TypeScript type definitions
│
├── 📁 App.Infra/               # 🐳 Docker Infrastructure
│   ├── docker-compose.yml      # 🔧 Development environment
│   └── README.md                # 📖 Docker setup guide
│
├── 📁 App.Docs/                # 📚 Organized Documentation
│   ├── api/                     # 🔌 API documentation
│   │   ├── specification.md     # 📋 Complete API reference
│   │   ├── versioning.md        # 🔄 API versioning strategy
│   │   └── openapi-automation.md # ✨ Auto-generation system
│   ├── backend/                 # ⚙️ Backend documentation
│   ├── frontend/                # 🎨 Frontend documentation
│   ├── infrastructure/          # 🚀 Infrastructure & deployment
│   ├── development/             # 🛠️ Development processes
│   └── guides/                  # 📖 Step-by-step guides
│       ├── getting-started.md   # 🎯 Quick start guide
│       ├── troubleshooting.md   # 🔧 Common issues & solutions
│       └── deployment.md        # 🚀 Production deployment
│
└── 📄 .env                     # 🔐 Environment configuration
```

## ✨ OpenAPI Auto-Generation System

### 🎯 What Makes This Special?

**🔄 Fully Automated**: OpenAPI documentation generates automatically when:
- Server starts up (if changes detected)
- You hit the health check with `?autoGen=true`  
- Manual trigger via API endpoint

**🎯 Type-Safe Frontend**: Auto-generates TypeScript client with:
- Full type definitions from OpenAPI spec
- Error handling and JWT token management
- React hooks for easy integration

**📖 Always In Sync**: Documentation never drifts from implementation because:
- Generated directly from TypeScript controller code
- CI/CD automatically updates specs on changes
- Interactive Swagger UI reflects latest API

### 🛠️ How It Works

#### 1. **Backend Controllers with Annotations**
```typescript
@Route('users')
@Tags('Users')  
export class UserController extends Controller {
  @Post('/api/register')
  @SuccessResponse('200', 'User registered successfully')
  public async registerUser(@Body() requestBody: RegisterUserRequest): Promise<RegisterResponse> {
    // Implementation - generates OpenAPI automatically! ✨
  }
}
```

#### 2. **Auto-Generated Frontend Client**
```typescript
import { apiClient } from '@/lib/api/apiClient';

// Type-safe API calls with auto-completion! 🎯
const result = await apiClient.register({
  email: 'user@example.com',
  password: 'secure123'
});
```

#### 3. **Smart Endpoints**
- `GET /api/system/health?autoGen=true` - Health check + auto-generate if needed
- `POST /api/system/generate-openapi` - Manual generation trigger
- `GET /api/docs` - Interactive Swagger UI

### 🚀 Development Workflow

   ```bash
# 1. Make API changes in controllers/DTOs
# 2. Server auto-detects changes and regenerates docs
# 3. Frontend gets updated type-safe client automatically  
# 4. View updated docs at /api/docs
# 5. Profit! 🎉
```

## 🔧 Essential Commands

### 🐳 Docker Commands
   ```bash
# Start development environment
cd App.Infra && docker compose up --watch

# View service status
docker compose ps

# View logs  
docker compose logs api -f    # API logs
docker compose logs web -f    # Frontend logs

# Stop services
docker compose down
```

### 📖 Documentation Commands
```bash
# Generate OpenAPI spec + frontend client
cd App.API && yarn api:sync

# Generate only OpenAPI spec
cd App.API && yarn api:generate

# Generate only frontend client  
cd App.Web && yarn api:client

# Force generation via API
curl -X POST "http://localhost:4000/api/system/generate-openapi?frontend=true"
```

### 🧪 Development Commands
```bash
# Run tests
cd App.API && yarn test         # Backend tests
cd App.Web && yarn test         # Frontend tests

# Code quality
cd App.API && yarn lint         # Backend linting
cd App.Web && yarn lint         # Frontend linting
cd App.Web && yarn typecheck    # TypeScript validation
```

## 🌐 API Documentation

### 📍 Base URLs
- **Development**: `http://localhost:4000/api`
- **Interactive Docs**: `http://localhost:4000/api/docs` ✨

### 🔑 Authentication
```bash
# JWT Bearer Token
Authorization: Bearer <jwt_token>
```

### 🎯 Key Endpoints
- `POST /users/register` - User registration
- `POST /users/login` - User authentication (returns JWT)
- `POST /users/logout` - User logout (invalidates token)
- `GET /system/health` - System health with OpenAPI status
- `POST /system/generate-openapi` - Manual OpenAPI generation

**📖 Full API Reference**: Visit `/api/docs` for interactive documentation!

## 🚀 Deployment

### 🐳 Production Docker
```bash
# Deploy with production configuration
cd App.Infra
docker compose -f docker-compose.prod.yml up -d --build
```

### ☁️ Cloud Deployment
```bash
# Build and push images
docker build -t your-registry/gogotime-api ./App.API
docker build -t your-registry/gogotime-web ./App.Web

docker push your-registry/gogotime-api
docker push your-registry/gogotime-web
```

**📖 Detailed Deployment Guide**: [`App.Docs/guides/deployment.md`](App.Docs/guides/deployment.md)

## 📚 Documentation

### 🎯 Quick Navigation

| Section | Description | Link |
|---------|-------------|------|
| **🚀 Getting Started** | Setup and first steps | [`App.Docs/guides/getting-started.md`](App.Docs/guides/getting-started.md) |
| **✨ OpenAPI System** | Auto-generation details | [`App.Docs/api/openapi-automation.md`](App.Docs/api/openapi-automation.md) |
| **🔧 Troubleshooting** | Common issues & fixes | [`App.Docs/guides/troubleshooting.md`](App.Docs/guides/troubleshooting.md) |
| **🏗️ Architecture** | System design & patterns | [`App.Docs/backend/architecture.md`](App.Docs/backend/architecture.md) |
| **🚀 Deployment** | Production deployment | [`App.Docs/guides/deployment.md`](App.Docs/guides/deployment.md) |
| **🐳 Docker Setup** | Container configuration | [`App.Docs/infrastructure/docker.md`](App.Docs/infrastructure/docker.md) |

### 📂 Full Documentation Index
```bash
App.Docs/
├── 📖 README.md                 # Documentation overview
├── api/                         # API documentation  
├── backend/                     # Backend architecture
├── frontend/                    # Frontend development
├── infrastructure/              # Docker & deployment
├── development/                 # Dev processes & quality
└── guides/                      # Step-by-step guides
```

## 🤝 Contributing

### 🛠️ Development Setup
1. **Fork** the repository
2. **Clone** your fork: `git clone <your-fork-url>`
3. **Setup**: Follow [`App.Docs/guides/getting-started.md`](App.Docs/guides/getting-started.md)
4. **Create branch**: `git checkout -b feature/amazing-feature`
5. **Make changes** following code standards
6. **Test**: Ensure all tests pass
7. **Document**: Update docs if needed  
8. **Commit**: `git commit -m 'feat: add amazing feature'`
9. **Push**: `git push origin feature/amazing-feature`
10. **Pull Request**: Open PR with description

### 📋 Code Standards
- **TypeScript**: Strict mode with proper typing
- **ESLint + Prettier**: Automated formatting and linting
- **Testing**: Write tests for new features
- **Documentation**: Update OpenAPI annotations and guides
- **Conventional Commits**: Follow commit message standards

## 🔒 Security & Privacy

- **🔐 JWT Authentication**: Secure token-based auth
- **🛡️ Password Hashing**: bcrypt with salt rounds
- **⚡ Rate Limiting**: Protection against abuse
- **🔍 Input Validation**: Joi schema validation
- **🚨 Security Headers**: CORS, CSP, and security middleware

## 📞 Support & Community

- **📚 Documentation**: [`App.Docs/`](App.Docs/) - Comprehensive guides
- **🐛 Issues**: [GitHub Issues](https://github.com/your-org/gogotime/issues) - Bug reports
- **💬 Discussions**: [GitHub Discussions](https://github.com/your-org/gogotime/discussions) - Questions
- **🔒 Security**: security@gogotime.com - Security issues
- **📖 API Docs**: http://localhost:4000/api/docs - Interactive API documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎉 Built with ❤️ by the GoGoTime Engineering Team**

*Featuring the world's most developer-friendly auto-generating API documentation system! 🚀*