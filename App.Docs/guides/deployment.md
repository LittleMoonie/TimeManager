# 🚀 Deployment Guide

Complete guide for deploying GoGoTime to different environments.

## 🎯 Environment Overview

| Environment | Purpose | URL | Database |
|-------------|---------|-----|----------|
| **Development** | Local development | localhost:3000 | Local PostgreSQL |
| **Staging** | Testing & QA | staging.gogotime.com | Cloud PostgreSQL |
| **Production** | Live application | gogotime.com | Production PostgreSQL |

## 🐳 Docker Deployment (Recommended)

### Development Deployment
```bash
# Standard development setup
cd App.Infra
docker compose up --build --watch

# Services available at:
# - Web: http://localhost:3000
# - API: http://localhost:4000
# - API Docs: http://localhost:4000/api/docs
```

### Production Deployment
```bash
# Create production environment file
cp .env.example .env.production

# Edit production values
nano .env.production

# Deploy with production compose
docker compose -f docker-compose.prod.yml up -d --build

# Check service health
docker compose -f docker-compose.prod.yml ps
```

## ⚙️ Environment Configuration

### Required Environment Variables

```bash
# .env.production
NODE_ENV=production

# Database (use your production values)
DB_HOST=your-db-host.com
DB_PORT=5432
DB_USER=gogotime_prod
DB_PASS=your-secure-password
DB_NAME=gogotime_prod
DB_SSL=true

# Security
SECRET=your-very-long-secure-jwt-secret-key-64-characters-minimum
BCRYPT_ROUNDS=12

# API
API_PORT=4000
API_HOST=0.0.0.0

# Frontend
WEB_PORT=3000
VITE_API_URL=https://api.gogotime.com

# CORS
CORS_ORIGIN=https://gogotime.com,https://www.gogotime.com
```

### Security Considerations
```bash
# Strong JWT secret (64+ characters)
SECRET=$(openssl rand -base64 64)

# Strong database password
DB_PASS=$(openssl rand -base64 32)

# Disable development features
LOG_LEVEL=error
VITE_SOURCEMAP=false
VITE_MINIFY=true
```

## 🌐 Cloud Deployment Options

### Option 1: Docker Compose on VPS

**Best for**: Small to medium deployments

```bash
# On your VPS
git clone <repository>
cd T-DEV-700-project-NCY_8

# Set up environment
cp .env.example .env
nano .env  # Configure for production

# Deploy
cd App.Infra
docker compose -f docker-compose.prod.yml up -d

# Set up reverse proxy (nginx)
sudo apt install nginx
sudo cp nginx.conf /etc/nginx/sites-available/gogotime
sudo ln -s /etc/nginx/sites-available/gogotime /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Option 2: Container Registry + Cloud Run

**Best for**: Serverless, auto-scaling deployments

```bash
# Build and push images
docker build -t gcr.io/your-project/gogotime-api ./App.API
docker build -t gcr.io/your-project/gogotime-web ./App.Web

docker push gcr.io/your-project/gogotime-api
docker push gcr.io/your-project/gogotime-web

# Deploy to Cloud Run (example)
gcloud run deploy gogotime-api \
  --image gcr.io/your-project/gogotime-api \
  --platform managed \
  --set-env-vars NODE_ENV=production,DB_HOST=your-db
```

### Option 3: Kubernetes

**Best for**: Large scale, enterprise deployments

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gogotime-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gogotime-api
  template:
    metadata:
      labels:
        app: gogotime-api
    spec:
      containers:
      - name: api
        image: your-registry/gogotime-api:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: host
```

## 📊 Database Setup

### PostgreSQL Cloud Options

#### Option A: Managed PostgreSQL (AWS RDS, Google Cloud SQL)
```bash
# Example connection string
DATABASE_URL="postgresql://username:password@instance.region.rds.amazonaws.com:5432/gogotime"
```

#### Option B: Self-hosted PostgreSQL
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE gogotime_prod;
CREATE USER gogotime WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE gogotime_prod TO gogotime;
```

### Database Migration
```bash
# Run migrations on production database
cd App.API
NODE_ENV=production yarn typeorm migration:run

# Backup before migrations (recommended)
pg_dump -h your-db-host -U username gogotime_prod > backup.sql
```

## 🔒 SSL/TLS Setup

### Option 1: Let's Encrypt (Free)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d gogotime.com -d www.gogotime.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Option 2: Cloud Load Balancer
Most cloud providers (AWS ALB, GCP Load Balancer) handle SSL termination automatically.

## 📈 Monitoring & Health Checks

### Health Check Endpoints
```bash
# API health
curl https://api.gogotime.com/api/system/health

# Database health
curl https://api.gogotime.com/api/system/health | jq '.openapi'

# Web app health
curl https://gogotime.com/health
```

### Monitoring Setup
```bash
# Add to docker-compose.prod.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## 🔄 CI/CD Deployment

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build and Deploy
      run: |
        # Build images
        docker build -t gogotime-api ./App.API
        docker build -t gogotime-web ./App.Web
        
        # Push to registry
        docker tag gogotime-api ${{ secrets.REGISTRY }}/gogotime-api:${{ github.sha }}
        docker push ${{ secrets.REGISTRY }}/gogotime-api:${{ github.sha }}
        
        # Deploy to server
        ssh ${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }} \
          "docker pull ${{ secrets.REGISTRY }}/gogotime-api:${{ github.sha }} && \
           docker-compose up -d"
```

## 🚀 Performance Optimization

### Production Optimizations
```bash
# Enable Node.js production optimizations
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=1024"

# Database connection pooling
DB_POOL_MIN=5
DB_POOL_MAX=20

# Enable compression and caching
# In nginx.conf:
gzip on;
gzip_types text/css application/javascript application/json;

# Browser caching
location /static {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Load Balancing
```nginx
# nginx load balancer
upstream api_backend {
    server api1:4000;
    server api2:4000;
    server api3:4000;
}

server {
    listen 80;
    server_name api.gogotime.com;
    
    location / {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database setup and migrations ready
- [ ] SSL certificates obtained
- [ ] DNS records configured
- [ ] Backup strategy in place
- [ ] Monitoring tools configured

### Deployment
- [ ] Build and test images locally
- [ ] Push images to registry
- [ ] Deploy to staging first
- [ ] Run database migrations
- [ ] Deploy to production
- [ ] Verify health checks pass

### Post-deployment
- [ ] Verify all services are running
- [ ] Test critical user flows
- [ ] Check logs for errors
- [ ] Verify monitoring is working
- [ ] Document any issues
- [ ] Update team on deployment status

## 🆘 Rollback Procedure

### Quick Rollback
```bash
# Rollback to previous version
docker compose -f docker-compose.prod.yml down
docker pull your-registry/gogotime-api:previous-sha
docker compose -f docker-compose.prod.yml up -d

# Rollback database (if needed)
psql -h your-db < backup-before-migration.sql
```

### Blue-Green Deployment
For zero-downtime deployments, maintain two identical environments and switch traffic between them.

## 📞 Support & Monitoring

### Log Management
```bash
# Centralized logging
docker run -d \
  --name filebeat \
  -v /var/log:/var/log:ro \
  -v /var/run/docker.sock:/var/run/docker.sock \
  elastic/filebeat

# View production logs
docker compose -f docker-compose.prod.yml logs --tail 100 -f
```

### Alerts & Notifications
- Set up alerts for:
  - Service downtime
  - High error rates
  - Database connection issues
  - High memory/CPU usage
  - SSL certificate expiration

---

**🎉 Your GoGoTime application is now deployed and ready for users!**

For ongoing maintenance, see:
- [`../infrastructure/observability.md`](../infrastructure/observability.md) - Monitoring
- [`troubleshooting.md`](./troubleshooting.md) - Common issues
- [`../infrastructure/ci-cd.md`](../infrastructure/ci-cd.md) - Automation
