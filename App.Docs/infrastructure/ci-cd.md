# CI/CD Pipeline & Deployment

## Overview

This document outlines the continuous integration and deployment strategy for the NCY_8 platform, including GitHub Actions workflows, Jenkins pipelines, containerization, and deployment strategies.

## CI/CD Architecture

### Pipeline Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Source Code   │    │   Build & Test  │    │   Deploy        │
│   Repository    │    │   Pipeline      │    │   Pipeline      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
    ┌─────▼─────┐          ┌─────▼─────┐          ┌─────▼─────┐
    │   GitHub  │          │   Docker  │          │ Kubernetes│
    │   Actions │          │   Build   │          │   Cluster │
    └─────┬─────┘          └─────┬─────┘          └─────┬─────┘
          │                      │                      │
    ┌─────▼─────┐          ┌─────▼─────┐          ┌─────▼─────┐
    │   Code    │          │   Image   │          │   Jenkins │
    │   Quality │          │   Registry│          │   Pipeline│
    └───────────┘          └───────────┘          └───────────┘
```

### Technology Stack

- **CI**: GitHub Actions for pull request validation
- **CD**: Jenkins for deployment orchestration
- **Containerization**: Docker with multi-stage builds
- **Registry**: Docker Hub / AWS ECR
- **Orchestration**: Kubernetes / Docker Swarm
- **Infrastructure**: Terraform for IaC
- **Monitoring**: Prometheus + Grafana

## GitHub Actions Workflows

### Pull Request Validation

```yaml
# .github/workflows/pr-validation.yml
name: PR Validation

on:
  pull_request:
    branches: [main, develop]
    types: [opened, synchronize, reopened]

jobs:
  validate:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: ncy8_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install yarn
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Lint code
        run: yarn lint

      - name: Type check
        run: yarn type-check

      - name: Run unit tests
        run: yarn test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ncy8_test
          REDIS_URL: redis://localhost:6379

      - name: Run integration tests
        run: yarn test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ncy8_test
          REDIS_URL: redis://localhost:6379

      - name: Build application
        run: yarn build

      - name: Security scan
        run: pnpm audit --audit-level moderate

      - name: Dependency check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'ncy-8'
          path: '.'
          format: 'JSON'

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: |
            coverage/
            test-results/
```

### Security Scanning

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run SAST scan
        uses: github/super-linter@v4
        env:
          DEFAULT_BRANCH: main
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/secrets
            p/owasp-top-ten
        env:
          SEMGREP_APP_TOKEN: ${{ secrets.SEMGREP_APP_TOKEN }}

      - name: Run CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

### Build and Push Images

```yaml
# .github/workflows/build.yml
name: Build and Push Images

on:
  push:
    branches: [main, develop]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: |
            ncy8/frontend
            ncy8/backend
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}

      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./App.Web
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./App.API
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Generate SBOM
        uses: anchore/sbom-action@v0
        with:
          path: .
          format: spdx-json
          output-file: sbom.spdx.json

      - name: Upload SBOM
        uses: actions/upload-artifact@v3
        with:
          name: sbom
          path: sbom.spdx.json
```

## Jenkins Pipeline

### Main Deployment Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io/ncy8'
        KUBECONFIG = credentials('kubeconfig')
        SLACK_WEBHOOK = credentials('slack-webhook')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                }
            }
        }
        
        stage('Build Images') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        script {
                            def frontendImage = docker.build(
                                "${DOCKER_REGISTRY}/frontend:${env.GIT_COMMIT_SHORT}",
                                "-f App.Web/Dockerfile App.Web/"
                            )
                            frontendImage.push()
                        }
                    }
                }
                
                stage('Build Backend') {
                    steps {
                        script {
                            def backendImage = docker.build(
                                "${DOCKER_REGISTRY}/backend:${env.GIT_COMMIT_SHORT}",
                                "-f App.API/Dockerfile App.API/"
                            )
                            backendImage.push()
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    sh '''
                        trivy image --exit-code 1 --severity HIGH,CRITICAL \
                            ${DOCKER_REGISTRY}/frontend:${GIT_COMMIT_SHORT}
                        trivy image --exit-code 1 --severity HIGH,CRITICAL \
                            ${DOCKER_REGISTRY}/backend:${GIT_COMMIT_SHORT}
                    '''
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    sh '''
                        kubectl apply -f k8s/staging/
                        kubectl set image deployment/ncy8-frontend \
                            frontend=${DOCKER_REGISTRY}/frontend:${GIT_COMMIT_SHORT} \
                            -n staging
                        kubectl set image deployment/ncy8-backend \
                            backend=${DOCKER_REGISTRY}/backend:${GIT_COMMIT_SHORT} \
                            -n staging
                    '''
                }
            }
        }
        
        stage('Run E2E Tests') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    sh 'pnpm test:e2e --config=e2e/staging.config.js'
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Blue-green deployment
                    sh '''
                        # Deploy to green environment
                        kubectl apply -f k8s/production-green/
                        kubectl set image deployment/ncy8-frontend \
                            frontend=${DOCKER_REGISTRY}/frontend:${GIT_COMMIT_SHORT} \
                            -n production-green
                        kubectl set image deployment/ncy8-backend \
                            backend=${DOCKER_REGISTRY}/backend:${GIT_COMMIT_SHORT} \
                            -n production-green
                        
                        # Wait for deployment to be ready
                        kubectl rollout status deployment/ncy8-frontend -n production-green
                        kubectl rollout status deployment/ncy8-backend -n production-green
                        
                        # Run health checks
                        ./scripts/health-check.sh production-green
                        
                        # Switch traffic to green
                        kubectl patch service ncy8-frontend -n production \
                            -p '{"spec":{"selector":{"version":"green"}}}'
                        kubectl patch service ncy8-backend -n production \
                            -p '{"spec":{"selector":{"version":"green"}}}'
                        
                        # Clean up blue environment
                        kubectl delete namespace production-blue
                    '''
                }
            }
        }
    }
    
    post {
        always {
            script {
                // Clean up workspace
                cleanWs()
            }
        }
        
        success {
            script {
                slackSend(
                    channel: '#deployments',
                    color: 'good',
                    message: "✅ Deployment successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                )
            }
        }
        
        failure {
            script {
                slackSend(
                    channel: '#deployments',
                    color: 'danger',
                    message: "❌ Deployment failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                )
            }
        }
    }
}
```

### Database Migration Pipeline

```groovy
// Jenkinsfile.migration
pipeline {
    agent any
    
    environment {
        DATABASE_URL = credentials('database-url')
        KUBECONFIG = credentials('kubeconfig')
    }
    
    stages {
        stage('Backup Database') {
            steps {
                script {
                    sh '''
                        pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
                        gzip backup_*.sql
                    '''
                }
            }
        }
        
        stage('Run Migrations') {
            steps {
                script {
                    sh '''
                        # Run migrations in dry-run mode first
                        yarn typeorm migration:run -d ./Server/Database.ts --check
                        
                        # Run actual migrations
                        yarn typeorm migration:run -d ./Server/Database.ts
                        
                        # Verify migration success
                        yarn typeorm migration:show -d ./Server/Database.ts
                    '''
                }
            }
        }
        
        stage('Verify Migration') {
            steps {
                script {
                    sh '''
                        # Run smoke tests
                        yarn test:migration-smoke
                        
                        # Check database integrity
                        yarn db:integrity-check
                    '''
                }
            }
        }
    }
    
    post {
        failure {
            script {
                // Rollback migration on failure
                sh 'yarn typeorm migration:revert -d ./Server/Database.ts'
            }
        }
    }
}
```

## Docker Configuration

### Multi-stage Dockerfile (Frontend)

```dockerfile
# front/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Security: non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S reactjs -u 1001
USER reactjs

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### Multi-stage Dockerfile (Backend)

```dockerfile
# back/Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app

# Security: non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

COPY --from=base /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

USER nodejs

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
```

### Docker Compose for Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ncy8_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./back
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/ncy8_dev
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./back:/app
      - /app/node_modules
    command: npm run dev

  frontend:
    build:
      context: ./front
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./front:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
```

## Kubernetes Deployment

### Frontend Deployment

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ncy8-frontend
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ncy8-frontend
  template:
    metadata:
      labels:
        app: ncy8-frontend
        version: blue
    spec:
      containers:
      - name: frontend
        image: ncy8/frontend:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
---
apiVersion: v1
kind: Service
metadata:
  name: ncy8-frontend
  namespace: production
spec:
  selector:
    app: ncy8-frontend
    version: blue
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

### Backend Deployment

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ncy8-backend
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ncy8-backend
  template:
    metadata:
      labels:
        app: ncy8-backend
        version: blue
    spec:
      containers:
      - name: backend
        image: ncy8/backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ncy8-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: ncy8-secrets
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: ncy8-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
---
apiVersion: v1
kind: Service
metadata:
  name: ncy8-backend
  namespace: production
spec:
  selector:
    app: ncy8-backend
    version: blue
  ports:
  - port: 80
    targetPort: 3001
  type: ClusterIP
```

## Deployment Strategies

### Blue-Green Deployment

```bash
#!/bin/bash
# scripts/blue-green-deploy.sh

set -e

ENVIRONMENT=${1:-staging}
NEW_VERSION=${2:-latest}

echo "Starting blue-green deployment to $ENVIRONMENT"

# Deploy to inactive environment (green)
kubectl apply -f k8s/$ENVIRONMENT-green/
kubectl set image deployment/ncy8-frontend \
    frontend=ncy8/frontend:$NEW_VERSION \
    -n $ENVIRONMENT-green
kubectl set image deployment/ncy8-backend \
    backend=ncy8/backend:$NEW_VERSION \
    -n $ENVIRONMENT-green

# Wait for deployment to be ready
echo "Waiting for green deployment to be ready..."
kubectl rollout status deployment/ncy8-frontend -n $ENVIRONMENT-green
kubectl rollout status deployment/ncy8-backend -n $ENVIRONMENT-green

# Run health checks
echo "Running health checks..."
./scripts/health-check.sh $ENVIRONMENT-green

# Switch traffic to green
echo "Switching traffic to green environment..."
kubectl patch service ncy8-frontend -n $ENVIRONMENT \
    -p '{"spec":{"selector":{"version":"green"}}}'
kubectl patch service ncy8-backend -n $ENVIRONMENT \
    -p '{"spec":{"selector":{"version":"green"}}}'

# Wait for traffic to stabilize
sleep 30

# Clean up blue environment
echo "Cleaning up blue environment..."
kubectl delete namespace $ENVIRONMENT-blue

echo "Blue-green deployment completed successfully"
```

### Canary Deployment

```bash
#!/bin/bash
# scripts/canary-deploy.sh

set -e

ENVIRONMENT=${1:-staging}
NEW_VERSION=${2:-latest}
CANARY_PERCENTAGE=${3:-10}

echo "Starting canary deployment to $ENVIRONMENT with $CANARY_PERCENTAGE% traffic"

# Deploy canary version
kubectl apply -f k8s/$ENVIRONMENT-canary/
kubectl set image deployment/ncy8-frontend-canary \
    frontend=ncy8/frontend:$NEW_VERSION \
    -n $ENVIRONMENT
kubectl set image deployment/ncy8-backend-canary \
    backend=ncy8/backend:$NEW_VERSION \
    -n $ENVIRONMENT

# Wait for canary to be ready
kubectl rollout status deployment/ncy8-frontend-canary -n $ENVIRONMENT
kubectl rollout status deployment/ncy8-backend-canary -n $ENVIRONMENT

# Gradually increase canary traffic
for percentage in 10 25 50 75 100; do
    echo "Increasing canary traffic to $percentage%"
    
    # Update service weights
    kubectl patch service ncy8-frontend -n $ENVIRONMENT \
        -p "{\"spec\":{\"selector\":{\"version\":\"canary-$percentage\"}}}"
    
    # Wait and monitor
    sleep 60
    
    # Check error rates and response times
    if ! ./scripts/health-check.sh $ENVIRONMENT; then
        echo "Health check failed at $percentage% traffic. Rolling back..."
        kubectl patch service ncy8-frontend -n $ENVIRONMENT \
            -p '{"spec":{"selector":{"version":"stable"}}}'
        exit 1
    fi
done

# Promote canary to stable
echo "Promoting canary to stable..."
kubectl set image deployment/ncy8-frontend \
    frontend=ncy8/frontend:$NEW_VERSION \
    -n $ENVIRONMENT
kubectl set image deployment/ncy8-backend \
    backend=ncy8/backend:$NEW_VERSION \
    -n $ENVIRONMENT

# Clean up canary
kubectl delete deployment ncy8-frontend-canary -n $ENVIRONMENT
kubectl delete deployment ncy8-backend-canary -n $ENVIRONMENT

echo "Canary deployment completed successfully"
```

## Infrastructure as Code

### Terraform Configuration

```hcl
# infrastructure/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority.0.data)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

# EKS Cluster
resource "aws_eks_cluster" "ncy8" {
  name     = "ncy8-cluster"
  role_arn = aws_iam_role.cluster.arn
  version  = "1.28"

  vpc_config {
    subnet_ids              = aws_subnet.private[*].id
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = ["0.0.0.0/0"]
  }

  depends_on = [
    aws_iam_role_policy_attachment.cluster_AmazonEKSClusterPolicy,
  ]
}

# Node Group
resource "aws_eks_node_group" "ncy8" {
  cluster_name    = aws_eks_cluster.ncy8.name
  node_group_name = "ncy8-nodes"
  node_role_arn   = aws_iam_role.node.arn
  subnet_ids      = aws_subnet.private[*].id

  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 1
  }

  instance_types = ["t3.medium"]

  depends_on = [
    aws_iam_role_policy_attachment.node_AmazonEKSWorkerNodePolicy,
    aws_iam_role_policy_attachment.node_AmazonEKS_CNI_Policy,
    aws_iam_role_policy_attachment.node_AmazonEC2ContainerRegistryReadOnly,
  ]
}

# RDS Database
resource "aws_db_instance" "ncy8" {
  identifier = "ncy8-db"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  
  db_name  = "ncy8"
  username = "postgres"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.ncy8.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "ncy8-db-final-snapshot"
  
  tags = {
    Name = "ncy8-database"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "ncy8" {
  name       = "ncy8-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_cluster" "ncy8" {
  cluster_id           = "ncy8-cache"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.ncy8.name
  security_group_ids   = [aws_security_group.redis.id]
}
```

## Monitoring & Alerting

### Deployment Monitoring

```yaml
# k8s/monitoring.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        - name: storage
          mountPath: /prometheus
      volumes:
      - name: config
        configMap:
          name: prometheus-config
      - name: storage
        persistentVolumeClaim:
          claimName: prometheus-storage
```

---

*This CI/CD strategy ensures reliable, secure, and scalable deployments with comprehensive monitoring and rollback capabilities.*
