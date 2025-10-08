# GoGoTime System Architecture

> [!SUMMARY] **Architecture Overview**
> GoGoTime follows a modern, layered architecture with React frontend, Node.js backend, and PostgreSQL database. The system emphasizes type safety, developer experience, and maintainable code organization.

## 📋 Table of Contents

- [[#🏗️ High-Level Architecture|High-Level Architecture]]
- [[#⚛️ Frontend Architecture|Frontend Architecture]]  
- [[#🔧 Backend Architecture|Backend Architecture]]
- [[#🗄️ Database Architecture|Database Architecture]]
- [[#🔐 Security Architecture|Security Architecture]]
- [[#🐳 Infrastructure Architecture|Infrastructure Architecture]]
- [[#🎯 Design Decisions|Design Decisions]]

---

## 🏗️ High-Level Architecture

> [!NOTE] **System Overview**
> GoGoTime uses a three-tier architecture with clear separation between presentation, application, and data layers.

```mermaid
graph TB
    subgraph "User Interface"
        U[👤 Users]
    end
    
    subgraph "Presentation Layer"
        W[🌐 Web Browser]
        M[📱 Mobile Browser]
    end
    
    subgraph "Application Layer"
        F[⚛️ React Frontend<br/>Vite + TypeScript + MUI]
        A[🔧 Express.js API<br/>Node.js + TypeScript + TypeORM]
    end
    
    subgraph "Data Layer"
        D[🐘 PostgreSQL<br/>Primary Database]
        S[💾 Active Sessions<br/>Authentication State]
    end
    
    subgraph "Infrastructure"
        DC[🐳 Docker Compose<br/>Development Environment]
        V[📁 Named Volumes<br/>Data Persistence]
    end
    
    U --> W
    U --> M
    W --> F
    M --> F
    F -.->|HTTP/REST| A
    A --> D
    A --> S
    DC --> F
    DC --> A
    DC --> D
    V --> D
```

### 🎯 Architecture Principles

1. **📦 Separation of Concerns**: Clear boundaries between layers
2. **🔄 Stateless API**: RESTful design with JWT authentication
3. **🏷️ Type Safety**: End-to-end TypeScript coverage
4. **🧪 Testability**: Modular design for easy unit testing
5. **🔄 Scalability**: Containerized for horizontal scaling

---

## ⚛️ Frontend Architecture

> [!NOTE] **React Application Structure**
> The frontend follows a feature-based organization pattern with shared components and centralized state management.

```mermaid
graph TB
    subgraph "React Application"
        subgraph "Entry Point"
            MAIN[📍 main.tsx]
            APP[🎯 App.tsx]
        end
        
        subgraph "Routing Layer"
            AR[🗺️ AppRouter]
            MR[📋 MainRoutes] 
            AUTH[🔐 AuthRoutes]
        end
        
        subgraph "Layout Components"
            ML[🏗️ MainLayout]
            SB[📊 Sidebar]
            HDR[📢 Header]
        end
        
        subgraph "Feature Modules"
            DASH[📈 Dashboard]
            UTILS[🔧 Utilities]
            SAMPLE[📄 Sample Pages]
        end
        
        subgraph "Shared Components"
            COMMON[🧩 Common UI]
            CARDS[🃏 Cards]
            EXT[📦 Extended]
        end
        
        subgraph "Core Logic"
            STORE[🗃️ Redux Store]
            HOOKS[🎣 Custom Hooks]
            TYPES[🏷️ Type Definitions]
        end
    end
    
    MAIN --> APP
    APP --> AR
    AR --> MR
    AR --> AUTH
    MR --> ML
    ML --> SB
    ML --> HDR
    ML --> DASH
    ML --> UTILS
    ML --> SAMPLE
    DASH --> COMMON
    UTILS --> CARDS
    SAMPLE --> EXT
    APP --> STORE
    DASH --> HOOKS
    HOOKS --> TYPES
```

### 🗂️ Frontend Directory Structure

```typescript
App.Web/
├── src/
│   ├── components/          // 🧩 Reusable UI Components
│   │   ├── layout/         // 🏗️ Layout-specific components
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── common/         // 🔄 Shared components
│   │   │   ├── Loader.tsx
│   │   │   └── Loadable.tsx
│   │   ├── guards/         // 🛡️ Route protection
│   │   │   ├── AuthGuard.tsx
│   │   │   └── GuestGuard.tsx
│   │   └── cards/          // 🃏 Card components
│   │
│   ├── features/           // 📦 Feature-based modules
│   │   ├── dashboard/      // 📈 Dashboard functionality
│   │   ├── auth/           // 🔐 Authentication pages
│   │   ├── utilities/      // 🔧 Utility pages
│   │   └── sample-page/    // 📄 Example page
│   │
│   ├── lib/                // 🛠️ Core application logic
│   │   ├── store/          // 🗃️ Redux store configuration
│   │   ├── routes/         // 🗺️ React Router setup
│   │   └── menu-items/     // 📋 Navigation configuration
│   │
│   ├── hooks/              // 🎣 Custom React hooks
│   ├── themes/             // 🎨 Material-UI themes
│   ├── types/              // 🏷️ TypeScript definitions
│   └── styles/             // 💄 Global styles
```

### 🔄 State Management

```mermaid
graph LR
    subgraph "Redux Store"
        CS[🔧 Customization State]
        US[👤 User State]
        AS[🔐 Auth State]
    end
    
    subgraph "Components"
        C1[⚛️ Component A]
        C2[⚛️ Component B]
        C3[⚛️ Component C]
    end
    
    subgraph "Actions"
        A1[📤 Actions]
        A2[📥 Reducers]
    end
    
    C1 -.->|useSelector| CS
    C2 -.->|useSelector| US
    C3 -.->|useSelector| AS
    C1 -->|dispatch| A1
    A1 --> A2
    A2 --> CS
```

---

## 🔧 Backend Architecture

> [!NOTE] **Express.js API Design**
> The backend follows a layered architecture with clear separation between routes, business logic, and data access.

```mermaid
graph TB
    subgraph "Express.js Application"
        subgraph "Entry Layer"
            SERVER[🚀 Server Entry Point]
            APP[🎯 Express App]
        end
        
        subgraph "Route Layer"
            ROUTES[🗺️ Route Handlers]
            USERS[👥 User Routes]
        end
        
        subgraph "Middleware Layer"
            AUTH[🔐 JWT Middleware]
            CORS[🌐 CORS Middleware]
            VALID[✅ Validation Middleware]
            ERROR[❌ Error Handler]
        end
        
        subgraph "Business Logic"
            CONTROLLERS[🎮 Controllers]
            SERVICES[🔧 Services]
        end
        
        subgraph "Data Access Layer"
            ORM[🗃️ TypeORM]
            MODELS[📊 Entity Models]
            REPO[🏪 Repositories]
        end
    end
    
    SERVER --> APP
    APP --> ROUTES
    ROUTES --> USERS
    USERS --> AUTH
    USERS --> VALID
    AUTH --> CONTROLLERS
    CONTROLLERS --> SERVICES
    SERVICES --> ORM
    ORM --> MODELS
    MODELS --> REPO
    ERROR -.->|Global Handler| APP
```

### 🗂️ Backend Directory Structure

```typescript
App.API/
├── src/
│   ├── routes/             // 🗺️ API Route Definitions
│   │   └── users.ts        // 👥 User management endpoints
│   │
│   ├── models/             // 📊 TypeORM Entity Models
│   │   ├── BaseEntity.ts   // 🏗️ Common entity fields
│   │   ├── user.ts         // 👤 User entity
│   │   └── activeSession.ts // 🔐 Session management
│   │
│   ├── config/             // ⚙️ Configuration Files
│   │   └── safeRoutes.ts   // 🛡️ JWT middleware
│   │
│   ├── server/             // 🚀 Server Setup
│   │   └── database.ts     // 🗄️ Database connection
│   │
│   └── migrations/         // 📈 Database Migrations
│
├── tests/                  // 🧪 API Tests
└── ecosystem.config.cjs    // 🔄 PM2 Configuration
```

### 🔗 API Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Routes
    participant M as Middleware
    participant S as Service
    participant D as Database
    
    C->>R: HTTP Request
    R->>M: Validate Request
    M->>M: Check JWT Token
    M->>S: Business Logic
    S->>D: Data Operations
    D-->>S: Query Results
    S-->>M: Processed Data
    M-->>R: Response Data
    R-->>C: HTTP Response
```

---

## 🗄️ Database Architecture

> [!NOTE] **PostgreSQL Schema Design**
> The database uses a normalized design with proper relationships and constraints for data integrity.

```mermaid
erDiagram
    User {
        uuid id PK
        varchar username
        varchar email UK
        varchar password
        timestamp createdAt
        timestamp updatedAt
    }
    
    ActiveSession {
        uuid id PK
        uuid userId FK
        varchar token UK
        timestamp createdAt
        timestamp updatedAt
    }
    
    BaseEntity {
        uuid id PK
        timestamp createdAt
        timestamp updatedAt
    }
    
    User ||--o{ ActiveSession : "has sessions"
    User ||--|| BaseEntity : "extends"
    ActiveSession ||--|| BaseEntity : "extends"
```

### 📊 Entity Relationships

| Entity | Purpose | Key Fields |
|--------|---------|------------|
| **BaseEntity** | 🏗️ Common fields for all entities | `id`, `createdAt`, `updatedAt` |
| **User** | 👤 User account management | `username`, `email`, `password` |
| **ActiveSession** | 🔐 JWT token tracking | `userId`, `token` |

### 🔧 TypeORM Configuration

```typescript
// Database connection configuration
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "password",
  database: process.env.DB_NAME || "gogotime",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User, ActiveSession],
  migrations: ["src/migrations/*.ts"],
})
```

---

## 🔐 Security Architecture

> [!WARNING] **Security Implementation**
> GoGoTime implements multiple layers of security to protect user data and prevent unauthorized access.

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Authentication Layer"
            JWT[🔑 JWT Tokens]
            HASH[🔒 Password Hashing]
            SESSION[⏱️ Session Management]
        end
        
        subgraph "Validation Layer"
            JOI[✅ Joi Schema Validation]
            TYPES[🏷️ TypeScript Types]
            SANITIZE[🧹 Input Sanitization]
        end
        
        subgraph "Transport Layer"
            HTTPS[🔐 HTTPS/TLS]
            CORS[🌐 CORS Policy]
            HEADERS[📋 Security Headers]
        end
        
        subgraph "Database Layer"
            ENCRYPT[🔒 Data Encryption]
            CONNECT[🔗 Connection Security]
            AUDIT[📊 Audit Logging]
        end
    end
    
    JWT --> SESSION
    HASH --> JWT
    JOI --> SANITIZE
    TYPES --> JOI
    HTTPS --> CORS
    CORS --> HEADERS
    ENCRYPT --> CONNECT
    CONNECT --> AUDIT
```

### 🛡️ Security Measures

1. **🔑 Authentication**
   - JWT token-based stateless authentication
   - bcrypt password hashing with salt rounds
   - Active session tracking in database

2. **✅ Input Validation**
   - Joi schema validation for all endpoints
   - TypeScript compile-time type checking
   - SQL injection prevention via TypeORM

3. **🌐 Transport Security**
   - HTTPS enforcement in production
   - CORS configuration for API access
   - Security headers (CSP, HSTS, etc.)

4. **📊 Monitoring**
   - Failed login attempt tracking
   - Session activity logging
   - API access monitoring

---

## 🐳 Infrastructure Architecture

> [!NOTE] **Containerized Development**
> Docker Compose provides a consistent development environment with hot reload and proper service isolation.

```mermaid
graph TB
    subgraph "Docker Compose Environment"
        subgraph "Application Services"
            WEB[🌐 Web Service<br/>React + Vite<br/>Port 3000]
            API[🔧 API Service<br/>Node.js + Express<br/>Port 4000]
        end
        
        subgraph "Data Services"
            DB[🐘 PostgreSQL<br/>Port 5432<br/>Named Volume]
        end
        
        subgraph "Development Features"
            HR[🔄 Hot Reload]
            FW[👀 File Watching]
            HL[🏥 Health Checks]
        end
        
        subgraph "Networking"
            NET[🌐 Bridge Network<br/>gogotime-network]
        end
    end
    
    WEB -.->|API Calls| API
    API --> DB
    HR --> WEB
    HR --> API
    FW --> WEB
    FW --> API
    HL --> WEB
    HL --> API
    HL --> DB
    NET --> WEB
    NET --> API
    NET --> DB
```

### 📦 Container Configuration

| Service | Image | Purpose | Ports | Volumes |
|---------|-------|---------|--------|---------|
| **web** | 🌐 Node.js + Vite | Frontend development server | `3000:3000` | Hot reload source |
| **api** | 🔧 Node.js + TypeScript | Backend API server | `4000:4000` | Hot reload source |
| **db** | 🐘 PostgreSQL 18 Alpine | Primary database | `5432:5432` | Persistent data |

### 🔄 Development Workflow

```mermaid
sequenceDiagram
    participant D as Developer
    participant DC as Docker Compose
    participant FS as File System
    participant C as Containers
    
    D->>DC: docker compose up
    DC->>C: Start all services
    C->>C: Install dependencies
    C->>C: Run health checks
    
    loop Development
        D->>FS: Edit source files
        FS->>C: File watcher triggers
        C->>C: Hot reload application
        C-->>D: Updated application
    end
```

---

## 🎯 Design Decisions

> [!NOTE] **Architectural Choices**
> Key decisions that shaped the GoGoTime architecture and their reasoning.

### 🧠 Technology Selection

#### Frontend Decisions

| Technology | Why Chosen | Alternatives Considered |
|------------|------------|------------------------|
| **React 19** | ⚛️ Latest features, concurrent rendering | Vue.js, Angular, Svelte |
| **Vite** | ⚡ Fast builds, HMR, ES modules | Webpack, Parcel, Rollup |
| **Material-UI v7** | 🎨 Comprehensive components, accessibility | Ant Design, Chakra UI |
| **Redux Toolkit** | 📊 Predictable state, DevTools | Zustand, Jotai, Context API |
| **TypeScript** | 🏷️ Type safety, better DX | JavaScript, Flow |

#### Backend Decisions

| Technology | Why Chosen | Alternatives Considered |
|------------|------------|------------------------|
| **Express.js** | 🚀 Mature, flexible, ecosystem | Fastify, Koa.js, NestJS |
| **TypeORM** | 🏗️ Decorator syntax, migrations | Prisma, Sequelize, Knex.js |
| **PostgreSQL** | 🐘 ACID compliance, JSON support | MySQL, MongoDB, SQLite |
| **JWT** | 🔑 Stateless, scalable | Sessions, OAuth, Passport |

### 🏗️ Architectural Patterns

1. **🔄 Layered Architecture**
   - **Why**: Clear separation of concerns, testability
   - **Implementation**: Routes → Services → Data Access

2. **📦 Feature-Based Organization**
   - **Why**: Scalability, maintainability, team collaboration
   - **Implementation**: Features as self-contained modules

3. **🏷️ TypeScript-First Development**
   - **Why**: Catch errors early, better refactoring, documentation
   - **Implementation**: Strict TypeScript across frontend and backend

4. **🐳 Container-First Infrastructure**
   - **Why**: Consistency, reproducibility, easy deployment
   - **Implementation**: Docker Compose for development, production-ready images

### 🔮 Future Considerations

> [!TIP] **Scalability Roadmap**
> Planned improvements for handling growth and new requirements.

```mermaid
graph TB
    subgraph "Current State"
        C1[📦 Monorepo Structure]
        C2[🐳 Docker Compose]
        C3[🗄️ Single Database]
    end
    
    subgraph "Phase 1: Enhancement"
        P1[🧪 Enhanced Testing]
        P2[📊 Monitoring & Metrics]
        P3[🔄 CI/CD Pipeline]
    end
    
    subgraph "Phase 2: Scale"
        P4[📈 Microservices]
        P5[💾 Caching Layer]
        P6[🌐 Load Balancing]
    end
    
    subgraph "Phase 3: Advanced"
        P7[📱 Mobile App]
        P8[🔄 Event Sourcing]
        P9[☁️ Cloud Native]
    end
    
    C1 --> P1
    C2 --> P2
    C3 --> P3
    P1 --> P4
    P2 --> P5
    P3 --> P6
    P4 --> P7
    P5 --> P8
    P6 --> P9
```

---

## 🏷️ Tags

#architecture #gogotime #react #nodejs #postgresql #typescript #docker #security #design-patterns

**Related Documentation:**
- [[DATABASE_DESIGN]] - Detailed database schema
- [[API_SPECIFICATION]] - API endpoints and contracts
- [[SECURITY_MEASURES]] - Security implementation details
- [[DEPLOYMENT_GUIDE]] - Infrastructure setup

---

> [!NOTE] **Document Maintenance**
> **Last Updated:** {date}  
> **Version:** 1.0.0  
> **Maintainers:** Architecture Team (Lazaro, Alexy, Massi, Lounis)