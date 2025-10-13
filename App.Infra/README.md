# 🐳 GoGoTime Docker Infrastructure

Modern Docker setup with hot reloading, health checks, and production-ready configurations.

## ✨ Features

- **🔥 Hot Reloading**: Docker Compose Watch Mode for instant code changes
- **🏥 Health Checks**: All services monitored with proper health checks
- **🚀 Multi-Stage Builds**: Optimized Dockerfiles for dev and production
- **🔒 Security**: Non-root users, security headers, and proper isolation
- **📊 Performance**: Named volumes, layer caching, and resource limits

## 🚀 Quick Start

### Development Mode (Recommended)

```bash
cd App.Infra
./scripts/dev.sh
```

This will:

- Start all services with hot reloading
- Mount source code with watch mode
- Enable development features (debug logs, etc.)
- Auto-restart on file changes

### Manual Development Start

```bash
cd App.Infra
docker compose up --build --watch
```

### Production Mode

```bash
cd App.Infra
./scripts/prod.sh
```

## 📋 Services

| Service | Port | Description                 | Health Check  |
| ------- | ---- | --------------------------- | ------------- |
| **Web** | 3000 | React 19 frontend with Vite | ✅ HTTP check |
| **API** | 4000 | Node.js Express API         | ✅ HTTP check |
| **DB**  | 5432 | PostgreSQL 16 database      | ✅ pg_isready |

## 🛠️ Commands

### Development

```bash
# Start with watch mode
docker compose up --build --watch

# View logs
docker compose logs -f

# Restart specific service
docker compose restart api

# Stop all services
docker compose down
```

### Production

```bash
# Start production services
docker compose -f docker-compose.prod.yml up -d --build

# View status
docker compose -f docker-compose.prod.yml ps

# Stop production services
docker compose -f docker-compose.prod.yml down
```

### Utilities

```bash
# Clean up everything
docker compose down -v --remove-orphans
docker system prune -af

# Database backup
docker exec gogotime-db pg_dump -U postgres gogotime > backup.sql

# View resource usage
docker stats
```

## 🔧 Configuration

Create your environment file:

```bash
cp .env.example .env
```

### Environment Variables

| Variable             | Default  | Description            |
| -------------------- | -------- | ---------------------- |
| `DB_HOST`            | db       | Database hostname      |
| `DB_PORT`            | 5432     | Database port          |
| `DB_USER`            | postgres | Database username      |
| `DB_PASS`            | password | Database password      |
| `DB_NAME`            | gogotime | Database name          |
| `JWT_SECRET`         | -        | JWT secret key         |
| `JWT_REFRESH_SECRET` | -        | JWT refresh secret key |
| `API_PORT`           | 4000     | API service port       |
| `WEB_PORT`           | 3000     | Web service port       |

## 📁 File Structure

```
App.Infra/
├── docker-compose.yml          # Development compose
├── docker-compose.prod.yml     # Production compose
├── scripts/
│   ├── dev.sh                 # Development startup script
│   └── prod.sh                # Production startup script
└── README.md                  # This file

../App.API/
│   ├── Dockerfile             # Multi-stage API container
│   └── ...
../App.Web/
    ├── Dockerfile             # Multi-stage web container
    ├── nginx.conf             # Production nginx config
    └── ...
```

## 🔥 Watch Mode Details

The new Docker Compose watch feature provides:

### API Watch

- **Sync**: `../App.API/src/` directory changes instantly sync
- **Sync**: `../App.API/package.json` changes sync
- **Rebuild**: `../App.API/yarn.lock` changes trigger rebuild

### Web Watch

- **Sync**: `../App.Web/src/` directory changes instantly sync
- **Sync**: `../App.Web/public/` directory changes sync
- **Sync**: `../App.Web/package.json` changes sync
- **Rebuild**: `../App.Web/yarn.lock` changes trigger rebuild

## 🏥 Health Checks

All services include comprehensive health checks:

- **Database**: PostgreSQL ready check
- **API**: HTTP endpoint health check
- **Web**: HTTP availability check

Services wait for dependencies to be healthy before starting.

## 🚀 Production Features

### Web (Nginx)

- Gzip compression
- Security headers
- Static asset caching
- React Router support
- Health endpoint

### API

- Non-root user
- Process manager (dumb-init)
- Production dependencies only
- Resource limits

### Database

- Persistent volumes
- Backup directory mounted
- Resource limits
- Connection pooling ready

## 🐛 Troubleshooting

### Port Conflicts

```bash
# Check what's using a port
netstat -tulpn | grep :3000

# Kill process using port
kill -9 $(lsof -t -i:3000)
```

### Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

### Clean Restart

```bash
# Nuclear option - clean everything
docker compose down -v --remove-orphans
docker system prune -af --volumes
docker compose up --build --watch
```

### Watch Mode Not Working

```bash
# Enable polling for file systems that don't support inotify
export CHOKIDAR_USEPOLLING=true
export WATCHPACK_POLLING=true
```

## 📚 Learning Resources

- [Docker Compose Watch Mode](https://docs.docker.com/compose/file-watch/)
- [Docker Multi-Stage Builds](https://docs.docker.com/develop/dev-best-practices/)
- [Container Health Checks](https://docs.docker.com/engine/reference/builder/#healthcheck)
