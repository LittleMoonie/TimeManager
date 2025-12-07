# 🚀 GoGoTime - Modern Full-Stack Application

[![CI/CD](https://github.com/your-org/gogotime/workflows/CI/badge.svg)](https://github.com/your-org/gogotime/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24.9+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

## 🌟 Overview

GoGoTime is a modern, full-stack application built with **TypeScript-first** approach, featuring automatic API documentation generation, type-safe frontend-backend communication, and a comprehensive Docker-based development environment.

### 🧭 Documentation

This project includes a comprehensive documentation hub built with Docusaurus.

To view the documentation, run the project using Docker and visit `http://localhost:3002`.

The source files for the documentation are located in the `/App.Docusaurus` directory.

### ✨ Key Features

- **🔄 Auto-Generated API Documentation** - OpenAPI specs generated directly from TypeScript code
- **⚡ Type-Safe API Client** - Auto-generated frontend SDK with full TypeScript support
- **🐳 Docker-First Development** - Complete containerized environment with hot reloading
- **🔒 Secure Authentication** - JWT-based auth with `argon2` password hashing and session management
- **📊 Interactive API Docs** - Live Swagger UI for API exploration and testing
- **🎯 Modern Stack** - React 19, Express.js, TypeORM, and PostgreSQL
- **⚙️ Smart Auto-Generation** - Detects changes and updates docs when API is healthy

## 🛠️ Technology Stack

```
├── 📁 App.API/                  # 🔌 Node.js + Express.js + TypeORM Backend
│   ├── src/
│   │   ├── Config/              # ⚙️ Application configuration
│   │   ├── Controllers/         # 🎯 API endpoints with tsoa decorators
│   │   ├── Dtos/                # 📋 TypeScript data transfer objects
│   │   ├── Entities/            # 🗄️ TypeORM database entities
│   │   ├── Middlewares/         # 🔗 Express middleware
│   │   ├── Migrations/          # ⬆️ TypeORM database migrations
│   │   ├── Repositories/        # 📦 Data access layer
│   │   ├── Routes/Generated/    # ✨ Auto-generated tsoa routes
│   │   ├── Seeds/               # 🌱 Database seeders
│   │   └── Services/            # ⚙️ Business logic services
│   ├── package.json
│   ├── swagger.json             # ✨ Auto-generated OpenAPI spec
│   └── tsoa.json                # 🔧 OpenAPI generation config
│
├── 📁 App.Web/                  # ⚛️ React 19 + Vite Frontend
│   ├── src/
│   │   ├── app/                 # 🚀 Main application logic
│   │   ├── assets/              # 🖼️ Static assets
│   │   ├── components/          # 🧩 Reusable React components
│   │   ├── constants/           # 💡 Application constants
│   │   ├── hooks/               # 🎣 Custom React hooks
│   │   ├── layout/              # 📐 Layout components
│   │   ├── lib/api/             # ✨ Auto-generated API client
│   │   │   ├── client.ts        # 📡 Generated TypeScript types
│   │   │   └── apiClient.ts     # 🛠️ Utility wrapper with error handling
│   │   ├── pages/               # 📄 Page-level components
│   │   ├── test/                # 🧪 Frontend tests
│   │   ├── theme/               # 🎨 MUI theme configuration
│   │   └── types/               # 🏷️ TypeScript type definitions
│   └── package.json
│
├── 📁 App.Infra/               # 🐳 Docker Infrastructure
│   ├── docker-compose.yml      # 🔧 Development environment
│   ├── docker-compose.prod.yml # 🚀 Production environment
│   ├── .env.example             # 📝 Environment variables template
│   └── README.md                # 📖 Docker setup guide
│
├── 📁 App.Docusaurus/          # 📚 Documentation Hub
│
└── 📄 .env.example             # 🔐 Environment configuration template
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
// App.API/Controllers/Authentication/AuthenticationController.ts (Simplified)
import { Body, Controller, Post, Route, Tags, SuccessResponse } from 'tsoa';
import { RegisterDto } from '@App.API/Dtos/Authentication/AuthenticationDto';
import { UserResponseDto } from '@App.API/Dtos/Users/UserResponseDto';

@Route('auth')
@Tags('Authentication')
export class AuthenticationController extends Controller {
  @Post('/register')
  @SuccessResponse('201', 'User registered successfully')
  public async register(@Body() requestBody: RegisterDto): Promise<UserResponseDto> {
    // Implementation - generates OpenAPI automatically! ✨
    return {} as UserResponseDto;
  }
}
```

#### 2. **Auto-Generated Frontend Client**

```typescript
import { apiClient } from '@/lib/api/apiClient';
import { LoginDto } from './App.API/Dtos/Authentication/AuthenticationDto';

// Type-safe API calls with auto-completion! 🎯
const loginData: LoginDto = { email: 'user@example.com', password: 'secure123' };
const result = await apiClient.authenticationLogin(loginData);
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

### 🌱 Database Seeding

- Seeders now run **only when** `RUN_SEEDERS_ON_BOOT=true` is set in the environment (default: `false`), and they are blocked when `NODE_ENV=production` unless `ALLOW_SEEDERS_IN_PRODUCTION=true`.
- Set `SEED_USER_PASSWORD` before running seeders so default accounts do not share a hard-coded password.
- Use the seed flag for the initial project boot or when you intentionally want to reseed an empty database.
- To reseed programmatically, call `runSeeds({ force: true })` after connecting to the data source.

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

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication (returns JWT)
- `POST /auth/logout` - User logout (invalidates token)
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
- **🛡️ Password Hashing**: `argon2` with secure salt rounds
- **⚡ Rate Limiting**: Protection against abuse
- **🔍 Input Validation**: `class-validator` for DTO validation
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

_Featuring the world's most developer-friendly auto-generating API documentation system! 🚀_
