# 🔧 Troubleshooting Guide

Common issues and solutions for GoGoTime development.

## 🚀 Startup Issues

### API Won't Start - "Port undefined"
**Problem**: Server shows `🚀 Server is listening on port undefined`

**Solution**:
```bash
# Ensure PORT is set in environment
cd App.Infra
DB_HOST=db PORT=4000 docker compose up api

# Or check .env file has correct values
grep PORT /home/lazar/Epitech/T-DEV-700-project-NCY_8/.env
```

### Database Connection Refused
**Problem**: `❌ Database connection error: ECONNREFUSED`

**Solutions**:
1. **Check database is running**:
   ```bash
   docker compose ps
   # gogotime-db should show "Up" and "healthy"
   ```

2. **Wrong hostname** (if running API outside Docker):
   ```bash
   # In .env, use localhost for local development
   DB_HOST=localhost
   
   # In Docker, use service name
   DB_HOST=db
   ```

3. **Restart database**:
   ```bash
   docker compose restart db
   docker compose logs db
   ```

### OpenAPI Spec Not Found
**Problem**: `/api/docs` shows "swagger.json not found"

**Solutions**:
1. **Manual generation**:
   ```bash
   cd App.API
   yarn api:generate
   ```

2. **Auto-generation via API**:
   ```bash
   curl -X POST "http://localhost:4000/api/system/generate-openapi"
   ```

3. **Check tsoa configuration**:
   ```bash
   # Ensure tsoa.json exists and controllers are in right path
   cat App.API/tsoa.json
   ```

## 🐳 Docker Issues

### Services Not Starting
**Problem**: Docker Compose services fail to start

**Solutions**:
1. **Clean rebuild**:
   ```bash
   docker compose down -v
   docker compose build --no-cache
   docker compose up
   ```

2. **Check Docker resources**:
   ```bash
   docker system df
   docker system prune -f  # Clean up space
   ```

3. **Port conflicts**:
   ```bash
   # Find what's using ports
   lsof -i :3000  # Web
   lsof -i :4000  # API  
   lsof -i :5432  # Database
   
   # Kill processes or change ports in .env
   ```

### File Sync Issues (WSL2)
**Problem**: Code changes not reflected in containers

**Solution**:
```bash
# Enable polling in .env
CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true

# Restart with watch mode
docker compose up --watch
```

## 📱 API Issues

### Auto-Generation Not Working
**Problem**: OpenAPI spec doesn't update automatically

**Check**:
1. **File timestamps**:
   ```bash
   # Check if controllers are newer than swagger.json
   ls -la App.API/src/controllers/
   ls -la App.API/swagger.json
   ```

2. **Generation service**:
   ```bash
   # Check OpenAPI service status
   curl "http://localhost:4000/api/system/openapi-status"
   ```

3. **Manual trigger**:
   ```bash
   curl -X POST "http://localhost:4000/api/system/generate-openapi?frontend=true"
   ```

### JWT Authentication Issues  
**Problem**: API calls return 401 Unauthorized

**Solutions**:
1. **Check JWT secrets**:
   ```bash
   # Ensure JWT_SECRET and JWT_REFRESH_SECRET are set in .env
   grep JWT_SECRET .env
   grep JWT_REFRESH_SECRET .env
   ```

2. **Token format**:
   ```typescript
   // Correct format
   headers: {
     'Authorization': 'Bearer ' + token
   }
   ```

3. **Debug token**:
   ```bash
   # Check token in database
   docker exec -it gogotime-db psql -U postgres -d gogotime_dev
   SELECT * FROM active_sessions;
   ```

## 🌐 Frontend Issues

### API Client Type Errors
**Problem**: TypeScript errors in generated API client

**Solutions**:
1. **Regenerate client**:
   ```bash
   cd App.Web
   yarn api:client
   ```

2. **Check OpenAPI spec validity**:
   ```bash
   # Validate spec
   npx swagger-parser validate App.API/swagger.json
   ```

3. **Clear TypeScript cache**:
   ```bash
   cd App.Web
   rm -rf node_modules/.cache
   yarn typecheck
   ```

### Module Resolution Errors
**Problem**: Cannot find module '@/lib/api/client'

**Solutions**:
1. **Check tsconfig paths**:
   ```json
   // App.Web/tsconfig.json
   {
     "compilerOptions": {
       "baseUrl": "./src",
       "paths": {
         "@/*": ["*"]
       }
     }
   }
   ```

2. **Ensure client exists**:
   ```bash
   ls -la App.Web/src/lib/api/client.ts
   ```

## 🗄️ Database Issues

### Migration Errors
**Problem**: TypeORM migration/synchronization fails

**Solutions**:
1. **Reset development database**:
   ```bash
   docker compose down db
   docker volume rm appinfra_pgdata
   docker compose up db
   ```

2. **Check entity definitions**:
   ```typescript
   // Ensure entities are properly exported
   // App.API/src/entities/Users/User.ts
   export default class User extends BaseEntity { ... }
   ```

### Connection Pool Exhausted
**Problem**: "remaining connection slots are reserved"

**Solution**:
```bash
# Check active connections
docker exec -it gogotime-db psql -U postgres -d gogotime_dev
SELECT count(*) FROM pg_stat_activity;

# Restart API to reset connections
docker compose restart api
```

## 🔧 Development Tools

### ESLint/TypeScript Errors
**Problem**: Linting or type checking fails

**Solutions**:
1. **Update dependencies**:
   ```bash
   cd App.API  # or App.Web
   yarn install
   ```

2. **Fix common issues**:
   ```bash
   # Auto-fix ESLint issues
   yarn lint --fix
   
   # Check TypeScript issues
   yarn typecheck
   ```

### Hot Reload Not Working
**Problem**: Changes not reflected automatically

**Solutions**:
1. **Check watch mode**:
   ```bash
   # Ensure using watch mode
   docker compose up --watch
   ```

2. **File permissions (WSL2)**:
   ```bash
   # Fix file permissions
   sudo chown -R $(whoami) ./App.API/src
   sudo chown -R $(whoami) ./App.Web/src
   ```

## 📊 Performance Issues

### Slow API Responses  
**Problem**: API endpoints responding slowly

**Debug**:
1. **Check database queries**:
   ```bash
   docker compose logs api | grep "query:"
   ```

2. **Monitor resources**:
   ```bash
   docker stats
   ```

3. **Database performance**:
   ```sql
   -- Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

### High Memory Usage
**Problem**: Docker containers using too much memory

**Solutions**:
1. **Limit container memory**:
   ```yaml
   # docker-compose.yml
   services:
     api:
       deploy:
         resources:
           limits:
             memory: 512M
   ```

2. **Node.js optimization**:
   ```bash
   # Set in .env
   NODE_OPTIONS="--max-old-space-size=512"
   ```

## 🆘 Emergency Commands

### Complete Reset
```bash
# Nuclear option - resets everything
cd App.Infra
docker compose down -v --remove-orphans
docker system prune -af
docker compose build --no-cache
docker compose up
```

### Quick Diagnostics
```bash
# Check all service status
docker compose ps

# Check logs for errors
docker compose logs --tail 50

# Test API health
curl http://localhost:4000/api/system/health

# Check database connectivity
docker exec gogotime-db pg_isready -U postgres
```

### Get Help Information
```bash
# API system status
curl "http://localhost:4000/api/system/openapi-status"

# Container resource usage
docker stats --no-stream

# Disk usage
docker system df
```

## 📞 Still Need Help?

If none of these solutions work:

1. **Check logs**: `docker compose logs [service-name]`
2. **Review documentation**: [`../README.md`](../README.md)
3. **Validate setup**: Follow [`getting-started.md`](./getting-started.md) again
4. **Check GitHub Issues**: Search for similar problems
5. **Create detailed issue**: Include logs, error messages, and steps to reproduce

---

**💡 Pro Tip**: Most issues are resolved by restarting services or regenerating files. When in doubt, try the "Complete Reset" commands above!
