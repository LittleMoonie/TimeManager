# 🏗️ Technical Architecture Overview

_A high-level technical roadmap for enterprise-grade development practices._

## 📐 Architecture & Code Quality

### Hygiene

- **Package Management**: Yarn workspaces with proper dependency isolation
- **Versioning**: Conventional commits with automated changelog generation
- **Quality Gates**: Unified Husky + lint-staged for pre-commit validation
- **Code Standards**: Unified ESLint + Prettier with TypeScript strict mode (configured at root)

### API Design

- **Versioning**: `/api/v1` with deprecation policy and backward compatibility
- **Documentation**: ✨ **Auto-generated OpenAPI specs** from TypeScript decorators
- **Validation**: `class-validator` for DTO validation, TypeScript DTOs for responses
- **Error Handling**: Unified error shape with global Express error handler
- **Time Management**: Store UTC, display per user timezone, handle DST with Luxon

## 🗄️ Data & Persistence

### Database Strategy

- **ORM**: TypeORM with PostgreSQL for type-safe database operations
- **Migrations**: Automated migrations with CI/CD integration
- **Backups**: Point-in-time recovery (PITR) with daily snapshots
- **Indexing**: UUID primary keys, unique constraints, optimized queries for clocks
- **Data Integrity**: Foreign key constraints, audit trails for compliance

### Data Modeling

```typescript
// App.API/Entities/Users/User.ts
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import { Company } from '../Companies/Company';
import { Role } from '../Roles/Role';
import { UserStatus } from './UserStatus';
import ActiveSession from './ActiveSessions';

/**
 * @description Represents a user in the system.
 */
@Entity('users')
@Index(['companyId', 'id'])
@Index(['companyId', 'email'], { unique: true })
@Index(['companyId', 'roleId'])
@Index(['companyId', 'statusId'])
export default class User extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this user belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid' }) companyId!: string;

  /**
   * @description The company associated with this user.
   */
  @ManyToOne(() => Company, (company) => company.users, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description The user's email address, unique within the company.
   * @example "john.doe@example.com"
   */
  @Column({ type: 'citext', nullable: false }) email!: string;

  /**
   * @description The first name of the user.
   * @example "John"
   */
  @Column({ type: 'varchar', length: 255, nullable: false }) firstName!: string;
  /**
   * @description The last name of the user.
   * @example "Doe"
   */
  @Column({ type: 'varchar', length: 255, nullable: false }) lastName!: string;

  /**
   * @description The hashed password of the user.
   */
  @Column({ type: 'varchar', length: 255, nullable: false })
  passwordHash!: string;
  /**
   * @description Indicates if the user must change their password at the next login.
   * @example false
   */
  @Column({ type: 'boolean', default: false })
  mustChangePasswordAtNextLogin!: boolean;

  /**
   * @description The unique identifier of the role assigned to the user.
   * @example "r1o2l3e4-i5d6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid', nullable: false }) roleId!: string;
  /**
   * @description The role assigned to the user.
   */
  @ManyToOne(() => Role, (role) => role.users, { onDelete: 'RESTRICT' })
  @JoinColumn([
    { name: 'roleId', referencedColumnName: 'id' },
    { name: 'companyId', referencedColumnName: 'companyId' },
  ])
  role!: Role;

  /**
   * @description Optional: The user's phone number in E.164 format.
   * @example "+15551234567"
   */
  @Column({ type: 'varchar', length: 32, nullable: true }) phoneNumber?: string;

  /**
   * @description Optional: The timestamp of the user's last successful login.
   * @example "2023-10-27T11:30:00Z"
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLogin?: Date;
  /**
   * @description Indicates if the user's data has been anonymized.
   * @example false
   */
  @Column({ default: false }) isAnonymized!: boolean;

  /**
   * @description List of active sessions for this user.
   */
  @OneToMany(() => ActiveSession, (s) => s.user)
  activeSessions!: ActiveSession[];

  /**
   * @description The unique identifier of the user's current status.
   * @example "s1t2a3t4-u5s6-7890-1234-567890abcdef"
   */
  @Column({ type: 'uuid', nullable: false }) statusId!: string;
  /**
   * @description The user's current status.
   */
  @ManyToOne(() => UserStatus, (s) => s.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'statusId' })
  status!: UserStatus;
}
```

## 🔐 Authentication & Security

### Current Implementation

- **JWT Authentication**: Custom implementation with bcrypt password hashing
- **Session Management**: Active session tracking in `ActiveSession` entity (PostgreSQL)
- **Token Storage**: Database-backed session validation
- **Security Headers**: Helmet, CORS, CSP with nonces, HSTS

### Authorization Patterns

- **RBAC**: Role-Based Access Control implemented via `Role` and `Permission` entities, managed by `RolePermissionService`.
- **Scoped Queries**: "Manager vs employee" data access patterns
- **Input Hardening**: `class-validator` for DTO validation, rate limiting with Redis storage

### Security Best Practices

```typescript
// Example: Secure route with authentication
// App.API/Controllers/Authentication/AuthenticationController.ts (Logout Simplified)
import { Controller, Post, Route, Security, Request, SuccessResponse } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { NotFoundError } from '../../Errors/HttpErrors';
import { UserResponseDto } from '../../Dtos/Users/UserResponseDto';
import { AuthenticationService } from '../../Services/AuthenticationService/AuthenticationService';
import { Service } from 'typedi';

@Route('auth')
@Service()
export class AuthenticationController extends Controller {
  constructor(private authenticationService: AuthenticationService) {
    super();
  }

  /**
   * @summary Logs out the current user by revoking their refresh token.
   */
  @Post('/logout')
  @Security('jwt')
  @SuccessResponse('204', 'User logged out successfully')
  public async logout(@Request() request: ExpressRequest): Promise<void> {
    const refreshToken =
      request.cookies?.refreshToken || (request.headers['x-refresh-token'] as string | undefined);

    if (!refreshToken) {
      throw new NotFoundError('No refresh token provided');
    }

    const companyId = (request.user as UserResponseDto)?.companyId;
    await this.authenticationService.logout(companyId, refreshToken);

    // Clear cookies
    request.res?.clearCookie('jwt', {
      /* ...options */
    });
    request.res?.clearCookie('refreshToken', {
      /* ...options */
    });

    this.setStatus(204);
  }
}
```

## 🚀 Caching, Queues & Real-time

### Redis Strategy

- **Key Naming**: Consistent namespace patterns (`app:cache:users:${id}`)
- **TTL Management**: Appropriate expiration for different data types
- **Cache-Aside Pattern**: Manual cache management with write-through policies
- **Stampede Protection**: Mutex locks for expensive operations

### Background Jobs

- **Queue System**: BullMQ with Redis for reliable job processing
- **Retry Logic**: Exponential backoff with dead letter queues
- **Job Types**: Email sending, report generation, data processing
- **Monitoring**: Queue health and job completion tracking

### Real-time Features (Optional)

- **WebSockets**: Socket.IO for live updates and notifications
- **Live Clocks**: Real-time time tracking visualization
- **KPI Updates**: Live dashboard metrics and alerts

## 📊 Observability & Operations

### Monitoring Stack

- **Metrics**: Prometheus with custom application metrics
- **Visualization**: Grafana dashboards for system and business metrics
- **Logging**: Structured JSON logging with Pino → centralized storage
- **Alerting**: SLO/SLI-based alerts with on-call runbooks

### Health Checks

```typescript
// System health endpoint with OpenAPI status
@Get('/api/system/health')
public async getHealth(@Query() autoGen?: boolean): Promise<HealthResponse> {
  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    openapi: {
      lastGenerated: lastGeneratedAt?.toISOString(),
      needsRegeneration: await OpenApiService.needsRegeneration()
    }
  };
}
```

### Performance Monitoring

- **Database**: Query performance tracking and optimization
- **API**: Request/response times and error rates
- **Frontend**: Core Web Vitals and user experience metrics
- **Infrastructure**: Resource utilization and scaling metrics

## 🔄 CI/CD & Environment Management

### Pipeline Strategy

- **Multi-stage**: Build → Test → Security Scan → Deploy
- **Container Strategy**: Multi-stage Dockerfiles with distroless production images
- **Environment Parity**: Consistent configuration across dev/staging/prod
- **Deployment**: Blue-green or canary deployments with automated rollback

### Security Integration

- **SAST/DAST**: Static analysis with Semgrep, dynamic testing with OWASP ZAP
- **Dependency Scanning**: Automated vulnerability detection and patching
- **Container Security**: Image scanning with Trivy/Grype, SBOM generation
- **Secrets Management**: SOPS/Doppler/Vault integration with rotation policies

## 🧪 Testing Strategy

### Test Pyramid

- **Unit Tests**: Jest for business logic and utilities
- **Integration Tests**: API endpoint testing with Supertest
- **Contract Tests**: ✨ **OpenAPI-driven tests** with generated schemas
- **E2E Tests**: Playwright for critical user journeys
- **Load Tests**: k6 for performance validation and capacity planning

### Test Automation

```typescript
// Example: API contract test using generated types
import { paths } from '../generated/api-types';
import { LoginDto } from '../../App.API/Dtos/Authentication/AuthenticationDto';
import { AuthResponseDto } from '../../App.API/Dtos/Authentication/AuthenticationDto';

type LoginEndpoint = paths['/auth/login']['post'];

describe('POST /auth/login', () => {
  it('should return valid login response', async () => {
    const request: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await api.post('/auth/login').send(request);

    // Type-safe assertions based on OpenAPI spec
    expect(response.body).toMatchObject<AuthResponseDto>({
      token: expect.any(String),
      refreshToken: expect.any(String),
      user: expect.objectContaining({
        id: expect.any(String),
        email: 'test@example.com',
      }),
    });
  });
});
```

## 🌐 Frontend Architecture

### Technology Stack

- **Framework**: React 19 with Vite for fast development
- **State Management**: Zustand for global state management
- **UI Framework**: Material-UI (MUI) v7 with custom theming
- **Type Safety**: ✨ **Auto-generated API client** from OpenAPI specs
- **Testing**: Vitest + React Testing Library + Playwright

### Development Experience

```typescript
// Type-safe API calls with auto-completion
import { apiClient } from '@/lib/api/apiClient';
import { LoginDto } from '../../App.API/Dtos/Authentication/AuthenticationDto';

const handleLogin = async (credentials: LoginDto) => {
  try {
    const result = await apiClient.authenticationLogin(credentials);
    if (result.token) {
      // JWT token automatically stored and managed
      navigate('/dashboard');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      setError(error.message); // Typed error handling
    }
  }
};
```

## 🔗 Network & Delivery

### Infrastructure

- **Reverse Proxy**: Nginx with Let's Encrypt SSL automation
- **Performance**: HTTP/2, Brotli compression, optimized caching headers
- **Security**: Proper CORS configuration, SameSite cookies, domain strategy

### Content Delivery

- **Static Assets**: Optimized builds with Vite bundling
- **API Responses**: Gzip compression with appropriate cache headers
- **Images**: WebP format with lazy loading and responsive sizing

## 📚 Documentation & Developer Experience

### Documentation Strategy

- **✨ Auto-Generated API Docs**: OpenAPI specs as single source of truth
- **Interactive Documentation**: Swagger UI at `/api/docs` for live testing
- **Type Generation**: Automatic TypeScript client generation for frontend
- **Architecture Decisions**: ADRs for major technical decisions

### Developer Onboarding

```bash
# One-command setup
cd App.Infra && docker compose up --build --watch

# Immediate access to:
# - http://localhost:3000 (Frontend)
# - http://localhost:4000/api/docs (Interactive API docs)
# - Hot reloading for both frontend and backend
```

### Development Tools

- **Live Reloading**: Docker Compose watch mode for instant feedback
- **Type Safety**: Full TypeScript coverage with strict mode
- **Code Generation**: API client auto-generation on backend changes
- **Quality Gates**: Pre-commit hooks (Husky, lint-staged) with automated formatting (Prettier) and linting (ESLint)

## 🎯 Product & User Experience

### Frontend Patterns

- **Route Protection**: Server-side and client-side authentication guards
- **Responsive Design**: Mobile-first approach with MUI breakpoints
- **Accessibility**: ARIA compliance, keyboard navigation, screen reader support
- **Performance**: Code splitting, lazy loading, optimized bundle sizes

### User Interface

```typescript
// Example: Protected route with type-safe navigation
const ProtectedDashboard = () => {
  const { user } = useAuth(); // Type-safe user context

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <Dashboard user={user} />
      </DashboardLayout>
    </AuthGuard>
  );
};
```

## 🚀 Future Enhancements

### Planned Features

- **API Versioning**: Implementation of `/api/v1`, `/api/v2` with deprecation handling
- **Microservices**: Service decomposition with proper API gateways
- **Advanced Caching**: Redis Cluster with distributed caching strategies
- **Real-time Analytics**: Live dashboard with WebSocket updates
- **Internationalization**: i18n support with proper locale handling

### Scalability Considerations

- **Database Scaling**: Read replicas, connection pooling, query optimization
- **Horizontal Scaling**: Load balancing, session clustering, stateless design
- **Caching Layers**: Multi-level caching with CDN integration
- **Performance Monitoring**: APM integration with distributed tracing

---

## 🎯 Key Benefits of This Architecture

### ✨ **Auto-Generated Documentation**

- **Always Current**: Documentation automatically updates with code changes
- **Type Safety**: Frontend gets type-safe API client without manual maintenance
- **Developer Experience**: Interactive API testing and exploration
- **Quality Assurance**: Compile-time validation prevents API contract drift

### 🚀 **Modern Development Workflow**

- **Fast Feedback**: Hot reloading with Docker Compose watch mode
- **Quality Gates**: Automated linting, testing, and security scanning
- **Consistent Environment**: Docker ensures development/production parity
- **Easy Onboarding**: One-command setup for new developers

### 📊 **Production-Ready Operations**

- **Observability**: Comprehensive monitoring, logging, and alerting
- **Security**: Enterprise-grade authentication, authorization, and hardening
- **Performance**: Optimized database queries, caching, and asset delivery
- **Reliability**: Health checks, graceful degradation, and automated recovery

---

_This overview serves as a technical roadmap for building and maintaining a production-ready, enterprise-grade application with modern development practices and automated documentation generation._
