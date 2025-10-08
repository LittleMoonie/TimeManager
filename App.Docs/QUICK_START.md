# GoGoTime Quick Start Guide

> [!SUMMARY] **Get Running in 5 Minutes**
> This guide gets you up and running with GoGoTime in under 5 minutes using Docker Compose. Perfect for new developers or quick project setup.

## 📋 Table of Contents

- [[#⚡ Prerequisites|Prerequisites]]
- [[#🚀 Installation Steps|Installation Steps]]
- [[#🔍 Verification|Verification]]
- [[#🎯 Next Steps|Next Steps]]

---

## ⚡ Prerequisites

> [!NOTE] **System Requirements**
> Minimal setup requirements for running GoGoTime locally.

### 🛠️ Required Software

| Software | Version | Purpose | Installation |
|----------|---------|---------|--------------|
| **Docker** | 20.10+ | Container runtime | [Install Docker](https://docs.docker.com/get-docker/) |
| **Docker Compose** | V2 | Multi-container orchestration | Included with Docker Desktop |
| **Git** | 2.0+ | Version control | [Install Git](https://git-scm.com/downloads) |
| **Node.js** | 24+ | Optional for local development | [Install Node.js](https://nodejs.org/) |

### ✅ System Check

```bash
# Verify installations
docker --version          # Should show 20.10+
docker compose version    # Should show v2.x
git --version            # Should show 2.x+

# Test Docker
docker run hello-world   # Should complete successfully
```

---

## 🚀 Installation Steps

### 1️⃣ Clone Repository

```bash
# Clone the project
git clone <your-repository-url>
cd T-DEV-700-project-NCY_8

# Verify structure
ls -la
# Should see: App.API/ App.Web/ App.Infra/ App.Docs/ README.md
```

### 2️⃣ Environment Setup (Optional)

```bash
# Copy environment template (optional - has sensible defaults)
cp .env.example .env

# Edit environment if needed (optional)
nano .env
```

> [!TIP] **Default Configuration**
> The application works out-of-the-box with default settings. Environment configuration is optional for development.

**Default Ports:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- PostgreSQL: `localhost:5432`

### 3️⃣ Start Application

```bash
# Navigate to infrastructure directory
cd App.Infra

# Start all services (first time - will build images)
docker compose up --build

# Or run in background
docker compose up --build -d
```

**What happens during startup:**
1. 🐘 PostgreSQL database starts
2. 📦 Dependencies install automatically  
3. 🏗️ TypeScript compilation
4. 🗄️ Database initialization
5. ⚡ Development servers start with hot reload

### 4️⃣ Wait for Services

```bash
# Monitor startup logs
docker compose logs -f

# Wait for these success messages:
# ✅ PostgreSQL: "database system is ready to accept connections"
# ✅ API: "Server running on port 4000" 
# ✅ Web: "Local:   http://localhost:3000/"
```

---

## 🔍 Verification

### 🌐 Access Application

**Open in your browser:**
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Health**: [http://localhost:4000/api/users/testme](http://localhost:4000/api/users/testme)

### ✅ Health Checks

```bash
# Test API endpoint
curl http://localhost:4000/api/users/testme
# Expected: {"success": true, "msg": "all good"}

# Check all services are running
docker compose ps
# All services should show "Up" status
```

### 🧪 Create Test Account

```bash
# Register a test user
curl -X POST http://localhost:4000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "testpass123"
  }'

# Expected: {"success": true, "userID": "...", "msg": "The user was successfully registered"}
```

---

## 🎯 Next Steps

### 🔐 Try the Application

1. **📱 Open Frontend**: Visit [http://localhost:3000](http://localhost:3000)
2. **🔑 Register/Login**: Create an account or use test credentials
3. **🏠 Explore Dashboard**: Navigate through the interface
4. **🛠️ Check Utilities**: View typography, colors, and components

### 📚 Development Resources

> [!NOTE] **Learn More**
> Now that you have GoGoTime running, explore these resources for deeper understanding.

| Resource | Purpose | Link |
|----------|---------|------|
| 🏗️ **Architecture Guide** | Understand system design | [[ARCHITECTURE]] |
| 🔌 **API Documentation** | Learn API endpoints | [[API_SPECIFICATION]] |
| ⚛️ **Frontend Guide** | React app structure | [[FRONTEND_ARCHITECTURE]] |
| 🗄️ **Database Design** | Schema and models | [[DATABASE_DESIGN]] |
| 🧪 **Testing Guide** | Run tests | [[TESTING_STRATEGY]] |

### 🛠️ Development Commands

```bash
# View service logs
docker compose logs -f api     # Backend logs
docker compose logs -f web     # Frontend logs
docker compose logs -f db      # Database logs

# Restart services
docker compose restart api     # Restart API only
docker compose restart web     # Restart frontend only

# Stop services
docker compose down            # Stop all services
docker compose down -v         # Stop + remove volumes
```

### 🔧 Local Development (Alternative)

If you prefer running services locally without Docker:

```bash
# Terminal 1: Start database
cd App.Infra
docker compose up db -d

# Terminal 2: Start API
cd App.API
yarn install
yarn dev

# Terminal 3: Start frontend  
cd App.Web
yarn install
yarn dev
```

---

## 🆘 Troubleshooting

### 🐳 Docker Issues

**Port conflicts:**
```bash
# Check what's using ports 3000, 4000, 5432
lsof -i :3000
lsof -i :4000
lsof -i :5432

# Kill processes or change ports in docker-compose.yml
```

**Permission issues:**
```bash
# On Linux, fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker

# Test Docker without sudo
docker run hello-world
```

**Build failures:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up
```

### 🌐 Application Issues

**API not responding:**
```bash
# Check API container logs
docker compose logs api

# Check if database is ready
docker compose exec db pg_isready -U postgres

# Restart API service
docker compose restart api
```

**Frontend build errors:**
```bash
# Check frontend logs
docker compose logs web

# Clear node_modules cache
docker compose down
docker volume rm app-infra_web_node_modules
docker compose up --build
```

### 🔍 Debug Mode

```bash
# Run with debug logging
docker compose -f docker-compose.yml -f docker-compose.debug.yml up

# Or set environment variables
NODE_ENV=development
DEBUG=*
```

---

## 🏷️ Tags

#quick-start #setup #docker #development #gogotime #getting-started

**Related Documentation:**
- [[DEVELOPMENT_SETUP]] - Detailed development environment setup
- [[DEPLOYMENT_GUIDE]] - Production deployment instructions  
- [[TROUBLESHOOTING]] - Common issues and solutions
- [[ARCHITECTURE]] - Understanding the system design

---

> [!SUCCESS] **You're Ready! 🎉**
> GoGoTime is now running locally. Start exploring the application and building amazing features!

> [!NOTE] **Need Help?**
> - 🐛 **Issues**: Check [[TROUBLESHOOTING]] or create an issue
> - 💬 **Questions**: See our [[CONTRIBUTING]] guide
> - 📚 **Documentation**: Browse the complete [[INDEX]]

**Last Updated:** {date}  
**Maintainers:** DevOps Team (Lazaro, Alexy, Massi, Lounis)
