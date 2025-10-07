# NCY_8 Project Architecture - JavaScript Implementation

## 🏗️ Complete Monorepo Structure

```
ncy-8/
├── apps/
│   ├── web/                    # Next.js frontend (moved from 'front')
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # React components
│   │   │   └── lib/           # Utilities
│   │   ├── public/            # Static assets
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── api/                    # Express backend API
│   │   ├── src/
│   │   │   ├── config/        # Configuration
│   │   │   ├── middleware/    # Express middleware
│   │   │   ├── routes/        # API routes
│   │   │   ├── services/      # Business logic
│   │   │   ├── utils/         # Utilities
│   │   │   └── index.js       # Main entry point
│   │   ├── package.json
│   │   └── Dockerfile
│   └── worker/                 # BullMQ job processor (future)
├── packages/
│   ├── database/               # Prisma schema & client
│   │   ├── prisma/
│   │   │   └── schema.prisma  # Complete database schema
│   │   ├── src/
│   │   │   ├── index.js       # Main exports
│   │   │   ├── client.js      # Prisma client setup
│   │   │   ├── types.js       # JSDoc type definitions
│   │   │   └── seed.js        # Database seeding
│   │   └── package.json
│   ├── types/                  # Shared type definitions (JSDoc)
│   │   ├── src/
│   │   │   ├── auth.js        # Authentication types
│   │   │   ├── user.js        # User types
│   │   │   ├── api.js         # API response types
│   │   │   └── common.js      # Common enums & utilities
│   │   └── package.json
│   ├── utils/                  # Shared utilities
│   │   ├── src/
│   │   │   ├── auth.js        # Authentication utilities
│   │   │   ├── validation.js  # Validation helpers
│   │   │   └── index.js       # Main exports
│   │   └── package.json
│   └── config/                 # Shared ESLint, Prettier configs
├── infrastructure/
│   ├── docker/                 # Docker configurations
│   ├── nginx/                  # Nginx configs
│   └── postgres/               # Database init scripts
├── scripts/                    # Build & deployment scripts
├── .github/
│   └── workflows/              # GitHub Actions
├── docs/                       # Technical documentation
├── docker-compose.yml          # Local development
├── pnpm-workspace.yaml         # pnpm workspace config
├── package.json                # Root package.json
└── env.example                 # Environment variables template
```

## 🗄️ Database Schema (Prisma)

### Core Models
- **User**: Authentication, roles, status
- **Session**: JWT refresh token management
- **Organization**: Multi-tenant structure
- **Project**: Business entities
- **Task**: Project management
- **AuditLog**: Comprehensive audit trail
- **ErrorLog**: System error tracking
- **JobLog**: Background job monitoring

### Key Features
- ✅ UUID primary keys for better distribution
- ✅ Soft delete pattern for data recovery
- ✅ Comprehensive audit logging
- ✅ RBAC system with roles and permissions
- ✅ Multi-tenant organization structure
- ✅ GDPR compliance tables

## 🚀 Technology Stack

### Frontend (apps/web)
- **Next.js 15+** with App Router
- **JavaScript** (no TypeScript)
- **Tailwind CSS** (existing)
- **Material-UI** (to be added)

### Backend (apps/api)
- **Node.js 18+** with Express
- **JavaScript** (no TypeScript)
- **Prisma ORM** with PostgreSQL
- **Redis** for caching and sessions
- **BullMQ** for job processing
- **JWT** for authentication

### Shared Packages
- **@ncy-8/database**: Prisma client and schema
- **@ncy-8/types**: JSDoc type definitions
- **@ncy-8/utils**: Common utilities
- **@ncy-8/config**: ESLint, Prettier configs

### Infrastructure
- **Docker & Docker Compose**
- **PostgreSQL 15+**
- **Redis 7+**
- **Nginx** reverse proxy
- **GitHub Actions** for CI/CD

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Quick Start
```bash
# 1. Clone and install dependencies
git clone <repository>
cd ncy-8
pnpm install

# 2. Set up environment
cp env.example .env
# Edit .env with your configuration

# 3. Start development environment
docker-compose up -d postgres redis

# 4. Set up database
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5. Start development servers
pnpm dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/docs
- **Health Check**: http://localhost:3001/health
- **Database Studio**: `pnpm db:studio`

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users` - List users (admin/manager)
- `GET /api/v1/users/:id` - Get user details
- `POST /api/v1/users` - Create user (admin)
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (admin)

### Organizations
- `GET /api/v1/organizations` - List user organizations
- `GET /api/v1/organizations/:id` - Get organization details
- `POST /api/v1/organizations` - Create organization
- `PUT /api/v1/organizations/:id` - Update organization
- `DELETE /api/v1/organizations/:id` - Delete organization

### Projects
- `GET /api/v1/projects` - List projects
- `GET /api/v1/projects/:id` - Get project details
- `POST /api/v1/projects` - Create project
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Tasks
- `GET /api/v1/tasks` - List tasks
- `GET /api/v1/tasks/:id` - Get task details
- `POST /api/v1/tasks` - Create task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

## 🔒 Security Features

### Authentication & Authorization
- JWT access tokens (15min expiry)
- Refresh tokens (7 days, stored in Redis)
- Role-based access control (RBAC)
- Session management with Redis
- Password hashing with bcrypt

### Security Middleware
- Helmet for security headers
- CORS configuration
- Rate limiting (Redis-based)
- Input validation with Zod
- SQL injection prevention
- XSS protection

### Audit & Compliance
- Comprehensive audit logging
- GDPR compliance tables
- Error logging and monitoring
- Login attempt tracking
- Data retention policies

## 🧪 Testing Strategy

### Test Types
- **Unit Tests**: Jest for components and utilities
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for user journeys
- **Load Tests**: k6 for performance testing

### Test Commands
```bash
pnpm test              # Run all tests
pnpm test:unit         # Unit tests only
pnpm test:integration  # Integration tests
pnpm test:e2e         # End-to-end tests
pnpm test:coverage    # Coverage report
```

## 🚀 Deployment

### Docker Production
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Or use deployment script
./scripts/deployment/deploy.sh production
```

### Environment Variables
- Copy `env.example` to `.env`
- Update database URLs
- Set secure JWT secrets
- Configure CORS origins
- Set up email/SMTP (optional)

## 📈 Monitoring & Observability

### Health Checks
- `/health` - Liveness probe
- `/ready` - Readiness probe
- `/metrics` - Prometheus metrics

### Logging
- Structured JSON logging with Pino
- Request/response logging
- Error tracking and alerting
- Audit trail logging

### Metrics
- API response times
- Database query performance
- Cache hit rates
- User activity metrics
- System resource usage

## 🔄 Data Flow

```
Frontend (Next.js) → API (Express) → Database (PostgreSQL)
                          ↓
                    Cache (Redis) → Queue (BullMQ)
```

### Authentication Flow
1. User logs in with email/password
2. API validates credentials
3. JWT tokens generated (access + refresh)
4. Refresh token stored in Redis
5. Access token used for API requests
6. Token refresh when access token expires

### Request Flow
1. Frontend makes API request with JWT
2. Middleware validates JWT token
3. Authorization checks (RBAC)
4. Business logic execution
5. Database operations (with audit logging)
6. Response with proper error handling

## 🛠️ Development Workflow

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- Conventional commits
- Pre-commit quality gates

### Git Workflow
- Feature branches
- Pull request reviews
- Automated testing
- Code quality checks
- Semantic versioning

## 📚 Documentation

### Available Documentation
- `docs/ARCHITECTURE.md` - System architecture
- `docs/DATABASE.md` - Database design
- `docs/AUTH_SECURITY.md` - Security implementation
- `docs/API_VERSIONING.md` - API versioning strategy
- `docs/CI_CD.md` - Deployment pipelines
- `docs/TESTING.md` - Testing strategy

## 🎯 Next Steps

### Immediate Tasks
1. **Convert remaining API files** to JavaScript
2. **Set up shared packages** (types, utils, config)
3. **Create Docker configurations**
4. **Set up CI/CD pipelines**
5. **Add frontend components** with MUI

### Future Enhancements
1. **Real-time features** with WebSocket
2. **File upload system**
3. **Email notifications**
4. **Advanced monitoring**
5. **Mobile app** (React Native)

---

## 🚀 Bootstrap Commands

```bash
# Complete setup
pnpm install && pnpm dev

# Database setup
pnpm db:generate && pnpm db:migrate && pnpm db:seed

# Start all services
docker-compose up -d

# Run tests
pnpm test

# Build for production
pnpm build
```

This architecture provides a solid foundation for the NCY_8 platform with JavaScript throughout, comprehensive database design, and enterprise-grade security and monitoring capabilities.
