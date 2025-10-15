# 🐳 GoGoTime Docker Infrastructure

## 📋 Overview

Our Docker infrastructure provides a consistent, efficient, and scalable environment for developing, testing, and deploying the GoGoTime platform. By containerizing our applications, we ensure that they run reliably across various environments, from a developer's local machine to production servers.

## ✨ Key Features of Our Docker Setup

- **Hot Reloading**: Leveraging Docker Compose's watch mode for instant reflection of code changes during development.
- **Health Checks**: Comprehensive health checks for all services ensure application availability and proper functioning.
- **Multi-Stage Builds**: Optimized Dockerfiles create lean and secure production images by separating build-time dependencies from runtime environments.
- **Security Best Practices**: Containers are configured with non-root users and proper isolation to enhance security.
- **Performance Optimization**: Utilizing named volumes for persistent data, efficient layer caching during builds, and resource limits for stable operation.

## 🚀 Development Workflow with Docker

For local development, we recommend using Docker Compose, which orchestrates all necessary services (frontend, backend, database, etc.) with a single command.

### Development Mode

Our development setup is designed for maximum developer productivity:

- **Automated Startup**: A simple script initiates all services with hot reloading enabled.
- **Source Code Mounting**: Local source code is mounted into containers, allowing changes to be instantly reflected without manual restarts.
- **Development Features**: Debug logs and other development-specific configurations are enabled.
- **Automatic Restarts**: Services automatically restart or hot-reload upon detecting file changes.

### Manual Development Start

Developers can also manually start the Docker Compose environment, providing flexibility for specific scenarios.

## 📦 Core Services

Our Docker Compose setup includes several key services:

- **Web**: The React frontend application, served by Vite, accessible on a designated port.
- **API**: The Node.js Express backend API, providing core business logic, accessible on a designated port.
- **DB**: A PostgreSQL database instance, serving as the primary data store, accessible on its standard port.
- **Other Services**: Additional helpers such as Adminer, Prometheus, Grafana, Jenkins, node-exporter, and cAdvisor support database inspection and observability.
- **Docs**: The Docusaurus container now runs `yarn start:watch`, which continuously mirrors `App.API/swagger.json` into `static/swagger.json` and serves the docs (and embedded Swagger UI) at `http://localhost:3002`. Visit `/api` to browse the live API spec.

Each service is configured with appropriate health checks to ensure it's fully operational before dependent services start.

## 🔧 Configuration

Environment variables are used to configure our Dockerized applications, allowing for flexible setup across different environments. A `.env.example` file provides a template for essential variables such as database credentials, service ports, and secret keys.

## 🔥 Watch Mode Capabilities

The Docker Compose watch feature significantly enhances the development experience by automatically synchronizing local file changes into running containers. This applies to:

- **API Service**: Changes in source code (`src/`) and dependency manifests (`package.json`, `yarn.lock`) are monitored.
- **Web Service**: Changes in source code (`src/`), static assets (`public/`), and dependency manifests are monitored.

## 🏥 Health Checks

Robust health checks are implemented for all services to ensure their operational status:

- **Database**: Checks for database readiness (e.g., PostgreSQL's `pg_isready`).
- **API**: Verifies the availability of a dedicated HTTP health endpoint.
- **Web**: Confirms the web application is serving content via HTTP.

Services are configured to wait for their dependencies to become healthy before starting, preventing cascading failures.

## 🚀 Production Features

Our Docker setup includes production-ready configurations for optimal performance and security:

### Web (Nginx)

- **Gzip Compression**: Reduces payload size for faster content delivery.
- **Security Headers**: Implements HTTP security headers to mitigate common web vulnerabilities.
- **Static Asset Caching**: Configures caching for static files to improve load times.
- **React Router Support**: Ensures proper routing for single-page applications.

### API

- **Non-root User**: Applications run with reduced privileges for enhanced security.
- **Production Dependencies**: Only essential dependencies are included in production builds.
- **Resource Limits**: Containers are configured with CPU and memory limits to prevent resource exhaustion.

### Database

- **Persistent Volumes**: Data is stored on persistent volumes to ensure durability.
- **Backup Integration**: Supports integration with backup solutions.
- **Connection Pooling**: Optimized for efficient database connections.

## 🐛 Troubleshooting

Common Docker-related issues and their solutions are documented to assist developers:

- **Port Conflicts**: Guidance on identifying and resolving conflicts where multiple applications attempt to use the same host port.
- **Permission Issues**: Steps to address file permission problems that can arise with volume mounts.
- **Clean Restart**: Instructions for performing a complete cleanup and restart of the Docker environment.
- **Watch Mode Problems**: Solutions for ensuring file synchronization works correctly, especially in environments like WSL2.

## 🛣️ Future Enhancements

- Publish production-ready Docker images to a registry and document deployment commands.
- Add compose profiles for staging/production with resource limits, TLS termination, and read-only file systems.
- Introduce service health dashboards that pre-load Grafana with project-specific panels.
- Evaluate replacing Jenkins-in-Compose with GitHub Actions or another hosted CI to simplify the stack.

---

**SUMMARY**: The GoGoTime Docker infrastructure provides a powerful and flexible foundation for our applications, streamlining development and ensuring reliable, secure deployments across all environments.
