# GoGoTime Troubleshooting Guide

> [!WARNING] **Common Issues & Solutions**
> This guide helps you quickly resolve common issues with GoGoTime setup, development, and deployment. Check here first before creating support tickets!

## 📋 Table of Contents

- [[#🐳 Docker Issues|Docker Issues]]
- [[#⚛️ Frontend Problems|Frontend Problems]]
- [[#🔧 Backend Issues|Backend Issues]]
- [[#🗄️ Database Problems|Database Problems]]
- [[#🔐 Authentication Issues|Authentication Issues]]
- [[#🚀 Performance Problems|Performance Problems]]

---

## 🐳 Docker Issues

### 🔄 Container Won't Start

**Problem:** Services fail to start with `docker compose up`

**Symptoms:**
```bash
ERROR: failed to solve: process "/bin/sh -c yarn install" did not complete successfully
Container gogotime-api-1 exited with code 1
```

**Solutions:**

#### 1️⃣ Clear Docker Cache
```bash
# Stop all containers
docker compose down -v

# Remove containers and images
docker system prune -a

# Remove volumes
docker volume prune

# Rebuild from scratch
docker compose up --build --force-recreate
```

#### 2️⃣ Check Docker Resources
```bash
# Check available disk space
docker system df

# Check Docker status
docker info

# Increase Docker memory/CPU if needed
# Docker Desktop: Settings → Resources → Advanced
```

#### 3️⃣ Fix Permission Issues (Linux/WSL)
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker

# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

### 🌐 Port Conflicts

**Problem:** Port already in use errors

**Symptoms:**
```bash
Error: bind: address already in use
Cannot start service web: port is already allocated
```

**Solutions:**

#### 1️⃣ Find Process Using Port
```bash
# Check what's using port 3000
lsof -i :3000
netstat -tulpn | grep 3000

# Kill process (replace PID)
kill -9 <PID>
```

#### 2️⃣ Change Ports in Docker Compose
```yaml
# Edit App.Infra/docker-compose.yml
services:
  web:
    ports:
      - "3001:3000"  # Change host port
  api:
    ports:
      - "4001:4000"  # Change host port
```

#### 3️⃣ Use Alternative Ports
```bash
# Set custom ports via environment
WEB_PORT=3001 API_PORT=4001 docker compose up
```

### 💾 Volume Issues

**Problem:** Data not persisting or permission errors

**Symptoms:**
```bash
Permission denied: '/var/lib/postgresql/data'
Database initialization failed
```

**Solutions:**

#### 1️⃣ Reset Volumes
```bash
# Stop containers and remove volumes
docker compose down -v

# Remove specific volumes
docker volume rm $(docker volume ls -q | grep gogotime)

# Restart with fresh volumes
docker compose up --build
```

#### 2️⃣ Fix PostgreSQL Permissions
```bash
# Create volume with correct permissions
docker volume create --name postgres_data
docker run --rm -v postgres_data:/data alpine chown -R 999:999 /data

# Or use in docker-compose.yml:
services:
  db:
    user: "999:999"
```

---

## ⚛️ Frontend Problems

### 🔧 Build Errors

**Problem:** Vite build fails or hot reload not working

**Symptoms:**
```bash
[ERROR] Could not resolve "@/components/Layout"
Module not found: Can't resolve './components'
```

**Solutions:**

#### 1️⃣ Fix Path Aliases
```typescript
// Check vite.config.ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

#### 2️⃣ Clear Node Modules
```bash
cd App.Web
rm -rf node_modules yarn.lock
yarn install

# Or in Docker
docker compose down
docker volume rm app-infra_web_node_modules
docker compose up --build
```

#### 3️⃣ TypeScript Issues
```bash
# Check TypeScript version
yarn list typescript

# Reset TypeScript cache
rm -rf .tsc-cache
yarn typecheck

# Fix tsconfig.json paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 🎨 Material-UI Issues

**Problem:** Styling not applied or theme errors

**Symptoms:**
```bash
Warning: React does not recognize the `component` prop
TypeError: Cannot read property 'palette' of undefined
```

**Solutions:**

#### 1️⃣ Check Theme Provider
```typescript
// Ensure ThemeProvider wraps App
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '@/themes'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Your app content */}
    </ThemeProvider>
  )
}
```

#### 2️⃣ Fix SSR Issues
```typescript
// Add emotion cache for SSR
import createEmotionCache from '@/lib/createEmotionCache'

const clientSideEmotionCache = createEmotionCache()

function MyApp({ Component, emotionCache = clientSideEmotionCache, pageProps }) {
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  )
}
```

### 🔄 State Management Issues

**Problem:** Redux state not persisting or updating

**Symptoms:**
```bash
Cannot read properties of undefined (reading 'customization')
State changes not reflected in UI
```

**Solutions:**

#### 1️⃣ Check Store Configuration
```typescript
// Verify store setup
import { store, persistor } from '@/lib/store'

// Wrap app with providers
<Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
    <App />
  </PersistGate>
</Provider>
```

#### 2️⃣ Clear Redux Persist Cache
```bash
# Clear localStorage
localStorage.clear()

# Or programmatically
import { persistor } from '@/lib/store'
persistor.purge()
```

---

## 🔧 Backend Issues

### 🚀 Server Won't Start

**Problem:** Express server fails to start

**Symptoms:**
```bash
Error: Cannot find module 'typeorm'
Port 4000 is already in use
Database connection failed
```

**Solutions:**

#### 1️⃣ Check Dependencies
```bash
cd App.API
yarn install

# Check for version conflicts
yarn list --depth=0
yarn outdated
```

#### 2️⃣ Environment Variables
```bash
# Check .env file exists
ls -la .env*

# Verify required variables
echo $DB_HOST
echo $DB_PORT
echo $SECRET
```

#### 3️⃣ Port Issues
```bash
# Check if port is available
lsof -i :4000

# Use different port
PORT=4001 yarn dev
```

### 🗄️ TypeORM Issues

**Problem:** Database connection or entity errors

**Symptoms:**
```bash
ConnectionNotFoundError: Connection "default" was not found
Repository was not found
Migration failed
```

**Solutions:**

#### 1️⃣ Check Database Connection
```typescript
// Test connection in AppDataSource
import { AppDataSource } from './database'

AppDataSource.initialize()
  .then(() => console.log("✅ Database connected"))
  .catch(error => console.log("❌ Database error:", error))
```

#### 2️⃣ Fix Entity Registration
```typescript
// Ensure entities are registered
export const AppDataSource = new DataSource({
  // ...
  entities: [User, ActiveSession], // Add all entities
  synchronize: process.env.NODE_ENV === 'development',
})
```

#### 3️⃣ Migration Issues
```bash
# Generate migration
yarn typeorm migration:generate src/migrations/FixUserTable -d src/server/database.ts

# Run migrations
yarn typeorm migration:run -d src/server/database.ts

# Revert if needed
yarn typeorm migration:revert -d src/server/database.ts
```

---

## 🗄️ Database Problems

### 🐘 PostgreSQL Connection Issues

**Problem:** Cannot connect to PostgreSQL

**Symptoms:**
```bash
ECONNREFUSED 127.0.0.1:5432
password authentication failed for user "postgres"
database "gogotime" does not exist
```

**Solutions:**

#### 1️⃣ Check Database Container
```bash
# Verify database is running
docker compose ps db

# Check database logs
docker compose logs db

# Restart database
docker compose restart db
```

#### 2️⃣ Connection String Issues
```bash
# Test connection manually
docker compose exec db psql -U postgres -d gogotime

# Check environment variables
docker compose exec api env | grep DB_
```

#### 3️⃣ Database Not Created
```bash
# Create database manually
docker compose exec db createdb -U postgres gogotime

# Or connect and create
docker compose exec db psql -U postgres -c "CREATE DATABASE gogotime;"
```

### 🔄 Migration Problems

**Problem:** Migrations fail or data corruption

**Symptoms:**
```bash
Migration "CreateUser1640000000000" failed
duplicate key value violates unique constraint
relation "users" does not exist
```

**Solutions:**

#### 1️⃣ Reset Database (Development Only)
```bash
# ⚠️ WARNING: This deletes all data!
docker compose down -v
docker volume rm $(docker volume ls -q | grep postgres)
docker compose up -d db

# Let synchronize recreate tables
NODE_ENV=development yarn dev
```

#### 2️⃣ Fix Migration Order
```bash
# Check migration status
yarn typeorm migration:show -d src/server/database.ts

# Revert to specific migration
yarn typeorm migration:revert -d src/server/database.ts

# Run specific migration
yarn typeorm migration:run -d src/server/database.ts
```

#### 3️⃣ Manual Schema Fix
```sql
-- Connect to database
docker compose exec db psql -U postgres -d gogotime

-- Check table structure
\d users
\d active_sessions

-- Fix constraints if needed
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
```

---

## 🔐 Authentication Issues

### 🔑 JWT Token Problems

**Problem:** Authentication failing or tokens invalid

**Symptoms:**
```bash
JsonWebTokenError: invalid signature
TokenExpiredError: jwt expired
No token provided
```

**Solutions:**

#### 1️⃣ Check JWT Secret
```bash
# Verify SECRET environment variable
echo $SECRET
# Should be at least 32 characters

# Generate new secret if needed
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 2️⃣ Token Storage Issues
```javascript
// Check localStorage token
console.log(localStorage.getItem('token'))

// Clear invalid token
localStorage.removeItem('token')

// Check token format
const token = 'your-token-here'
console.log(JSON.parse(atob(token.split('.')[1]))) // Decode payload
```

#### 3️⃣ Session Management
```typescript
// Check active sessions in database
docker compose exec db psql -U postgres -d gogotime -c "SELECT * FROM active_sessions;"

// Clear expired sessions
docker compose exec db psql -U postgres -d gogotime -c "DELETE FROM active_sessions WHERE \"createdAt\" < NOW() - INTERVAL '24 hours';"
```

### 🚪 Login/Logout Issues

**Problem:** Users can't login or logout properly

**Symptoms:**
```bash
Wrong credentials (but password is correct)
Logout doesn't clear session
Redirect loop on login
```

**Solutions:**

#### 1️⃣ Password Hash Issues
```bash
# Test password hashing
node -e "
const bcrypt = require('@node-rs/bcrypt');
bcrypt.hash('your-password', 12).then(hash => {
  console.log('Hash:', hash);
  bcrypt.compare('your-password', hash).then(match => {
    console.log('Match:', match);
  });
});
"
```

#### 2️⃣ CORS Issues
```typescript
// Check CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000'],
  credentials: true, // Important for cookies
}

// Frontend fetch configuration
fetch('/api/users/login', {
  method: 'POST',
  credentials: 'include', // Include cookies
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email, password })
})
```

---

## 🚀 Performance Problems

### 🐌 Slow Application Response

**Problem:** App responds slowly or times out

**Symptoms:**
```bash
Request timeout after 30 seconds
High CPU usage in Docker containers
Database queries taking too long
```

**Solutions:**

#### 1️⃣ Check Resource Usage
```bash
# Monitor Docker containers
docker stats

# Check system resources
htop
# or
top
```

#### 2️⃣ Database Performance
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

-- Check database size
SELECT pg_size_pretty(pg_database_size('gogotime'));

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

#### 3️⃣ Application Optimization
```typescript
// Add database indexes
@Index("idx_users_email", ["email"])
@Entity()
export class User extends BaseEntity {
  // ...
}

// Use connection pooling
export const AppDataSource = new DataSource({
  // ...
  extra: {
    max: 20,              // Maximum connections
    min: 5,               // Minimum connections
    acquireTimeoutMillis: 60000,
    idleTimeoutMillis: 600000
  }
})
```

### 📦 Build Performance

**Problem:** Slow build times or out of memory errors

**Symptoms:**
```bash
JavaScript heap out of memory
Build taking more than 10 minutes
Docker image size too large
```

**Solutions:**

#### 1️⃣ Increase Memory Limits
```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"

# Docker memory limits
docker compose up --build -m 4g
```

#### 2️⃣ Optimize Docker Images
```dockerfile
# Use multi-stage builds
FROM node:24-alpine AS dependencies
COPY package*.json ./
RUN yarn install --frozen-lockfile

FROM node:24-alpine AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:24-alpine AS runtime
COPY --from=build /app/dist ./dist
```

#### 3️⃣ Build Optimization
```typescript
// Vite optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material']
        }
      }
    }
  }
})
```

---

## 🔧 Development Tools

### 🛠️ Debugging Commands

**Health Check Script:**
```bash
#!/bin/bash
# health-check.sh

echo "🏥 GoGoTime Health Check"
echo "========================"

echo "🐳 Docker Status:"
docker --version
docker compose --version

echo ""
echo "📦 Services Status:"
docker compose ps

echo ""
echo "📡 API Health:"
curl -s http://localhost:4000/api/users/testme || echo "❌ API not responding"

echo ""
echo "🌐 Frontend Status:"
curl -s -I http://localhost:3000 | head -1 || echo "❌ Frontend not responding"

echo ""
echo "🐘 Database Status:"
docker compose exec -T db pg_isready -U postgres || echo "❌ Database not responding"

echo ""
echo "💾 Disk Usage:"
docker system df

echo ""
echo "📊 Memory Usage:"
docker stats --no-stream
```

**Log Collection Script:**
```bash
#!/bin/bash
# collect-logs.sh

mkdir -p debug-logs
cd debug-logs

echo "Collecting GoGoTime debug information..."

# System info
uname -a > system-info.txt
docker --version >> system-info.txt
docker compose --version >> system-info.txt

# Container logs
docker compose logs web > frontend-logs.txt
docker compose logs api > backend-logs.txt
docker compose logs db > database-logs.txt

# Container status
docker compose ps > container-status.txt

# Resource usage
docker stats --no-stream > resource-usage.txt

echo "Debug logs collected in debug-logs/ directory"
```

---

## 📞 Getting Additional Help

### 🆘 When to Seek Help

If you've tried the solutions above and still have issues:

1. **🔍 Search existing issues**: Check if others have had similar problems
2. **📝 Create detailed issue**: Include error messages, logs, and steps to reproduce
3. **💬 Ask community**: Join our Discord or GitHub Discussions

### 📋 Information to Include

When reporting issues, include:

```markdown
## 🖥️ Environment
- OS: [Windows 11, macOS 13, Ubuntu 22.04]
- Node.js: [version]
- Docker: [version]
- Browser: [Chrome 95, Firefox 94]

## 🐛 Problem Description
Clear description of what's happening

## 🔄 Steps to Reproduce
1. Step one
2. Step two
3. Error occurs

## 📋 Error Messages
```
Paste complete error messages here
```

## 🧪 What I've Tried
- Solution 1: Result
- Solution 2: Result

## 📊 Additional Context
Logs, screenshots, or other relevant information
```

### 📚 Resources

| Issue Type | Resource | Contact |
|------------|----------|---------|
| 🐛 **Bugs** | [GitHub Issues](https://github.com/your-org/gogotime/issues) | |
| ❓ **Questions** | [GitHub Discussions](https://github.com/your-org/gogotime/discussions) | |
| 💬 **Chat** | [Discord Server](https://discord.gg/your-server) | |
| 🔒 **Security** | Email | security@yourdomain.com |
| 📧 **Support** | Email | support@yourdomain.com |

---

## 🏷️ Tags

#troubleshooting #debugging #docker #issues #solutions #support #help

**Related Documentation:**
- [[QUICK_START]] - Initial setup guide
- [[DEVELOPMENT_SETUP]] - Development environment
- [[DEPLOYMENT_GUIDE]] - Production deployment
- [[CONTRIBUTING]] - How to report issues

---

> [!TIP] **Quick Resolution Tips**
> - Always check Docker container logs first: `docker compose logs`
> - Clear cache when in doubt: `docker system prune -a`
> - Restart services: `docker compose restart`
> - Check environment variables: `docker compose exec api env`

> [!NOTE] **Document Maintenance**
> **Last Updated:** {date}  
> **Version:** 1.0.0  
> **Maintainers:** Support Team (Lazaro, Alexy, Massi, Lounis)

**Need immediate help?** Join our Discord: [discord.gg/your-server](https://discord.gg/your-server)
