# 🔧 Troubleshooting Guide

## 📋 Overview

This guide provides solutions to common issues encountered during the development and operation of the GoGoTime platform. It aims to help developers quickly diagnose and resolve problems, ensuring a smooth workflow. For detailed technical steps or specific command examples, please refer to the relevant documentation sections or consult the project's codebase.

## 🚀 Startup Issues

### API Won't Start - "Port undefined"

**Problem**: The API server reports that it's listening on an undefined port.

**Solution**: This typically indicates that the `PORT` environment variable is not correctly set. Ensure your `.env` file in `App.Infra` has the `PORT` variable defined with a valid value, or that it's passed correctly when starting the Docker Compose services.

### Database Connection Refused

**Problem**: The application fails to connect to the database, often with an `ECONNREFUSED` error.

**Solutions**:

1.  **Verify Database Status**: Confirm that the PostgreSQL database service is running and healthy within Docker Compose.
2.  **Check Hostname**: Ensure the `DB_HOST` environment variable is correctly configured. If running the API inside Docker, it should typically be the service name (`db`); if running the API outside Docker, it should be `localhost`.
3.  **Restart Database**: Sometimes, restarting the database service can resolve transient connection issues.

### OpenAPI Spec Not Found

**Problem**: The interactive API documentation (Swagger UI) reports that `swagger.json` cannot be found.

**Solutions**:

1.  **Manual Generation**: The OpenAPI specification might not have been generated. Trigger a manual generation from the `App.API` directory.
2.  **Auto-Generation Check**: Verify that the automatic OpenAPI generation process is functioning correctly (e.g., when the API server starts).
3.  **Tsoa Configuration**: Ensure the `tsoa.json` configuration file in `App.API` is correctly set up to point to your controllers.

## 🐳 Docker Issues

### Services Not Starting

**Problem**: Docker Compose services fail to start or exit unexpectedly.

**Solutions**:

1.  **Clean Rebuild**: Perform a clean rebuild of your Docker environment to clear any corrupted volumes or cached layers.
2.  **Check Docker Resources**: Ensure your Docker daemon has sufficient system resources (CPU, memory, disk space).
3.  **Port Conflicts**: Identify if any host ports required by Docker Compose are already in use by other applications.

### File Sync Issues (e.g., WSL2)

**Problem**: Code changes made on the host machine are not reflected inside the running Docker containers.

**Solution**: For certain file systems (like those in WSL2), Docker's file watching might require explicit polling. Enable `CHOKIDAR_USEPOLLING` and `WATCHPACK_POLLING` environment variables and restart your services in watch mode.

## 📱 API Issues

### Auto-Generation Not Working

**Problem**: The OpenAPI specification or frontend API client does not update automatically after code changes.

**Solutions**:

1.  **File Timestamps**: Verify that the timestamps of your controller files are newer than the generated `swagger.json`.
2.  **Generation Service Status**: Check the status of the OpenAPI generation service (if applicable).
3.  **Manual Trigger**: Manually trigger the OpenAPI generation process.

### JWT Authentication Issues

**Problem**: API calls to protected endpoints return `401 Unauthorized` errors.

**Solutions**:

1.  **Check JWT Secrets**: Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` environment variables are correctly set and match between the client and server.
2.  **Token Format**: Verify that the JWT is sent in the correct `Authorization: Bearer <token>` header format.
3.  **Debug Token**: Inspect the JWT token (e.g., using online JWT decoders) and check active sessions in the database.

## 🌐 Frontend Issues

### API Client Type Errors

**Problem**: TypeScript compilation errors related to the auto-generated API client.

**Solutions**:

1.  **Regenerate Client**: Manually regenerate the frontend API client.
2.  **OpenAPI Spec Validity**: Validate the `swagger.json` file to ensure it's a valid OpenAPI specification.
3.  **Clear TypeScript Cache**: Clear the TypeScript cache and reinstall dependencies to resolve potential caching issues.

### Module Resolution Errors

**Problem**: The frontend application cannot find modules (e.g., `@/lib/api/client`).

**Solutions**:

1.  **Check `tsconfig.json` Paths**: Verify that the `paths` configuration in `App.Web/tsconfig.json` is correctly set up for module aliases.
2.  **Client Existence**: Confirm that the auto-generated client file exists at the expected location.

## 🗄️ Database Issues

### Migration Errors

**Problem**: TypeORM migrations fail to run or synchronize the database schema.

**Solutions**:

1.  **Reset Development Database**: For development, a complete reset of the database can often resolve complex migration issues.
2.  **Check Entity Definitions**: Ensure TypeORM entities are correctly defined and exported.

### Connection Pool Exhausted

**Problem**: The database reports that all connection slots are reserved.

**Solution**: This indicates too many active database connections. Check the number of active connections and restart the API service to clear the connection pool.

## 🔧 Development Tools

### ESLint/TypeScript Errors

**Problem**: Linting or type checking fails during development.

**Solutions**:

1.  **Update Dependencies**: Ensure all project dependencies are up-to-date.
2.  **Fix Common Issues**: Run auto-fix commands for ESLint and check TypeScript issues.

### Hot Reload Not Working

**Problem**: Changes to code are not automatically reflected in the running application.

**Solutions**:

1.  **Check Watch Mode**: Verify that Docker Compose is running in watch mode.
2.  **File Permissions**: For certain environments (e.g., WSL2), file permission issues can prevent hot reloading. Correct file ownership and permissions.

## 📊 Performance Issues

### Slow API Responses

**Problem**: API endpoints are responding slowly.

**Debug**:

1.  **Database Queries**: Analyze database query logs for slow queries.
2.  **Resource Monitoring**: Monitor Docker container resource usage (CPU, memory).
3.  **Database Performance**: Check database performance metrics for bottlenecks.

### High Memory Usage

**Problem**: Docker containers consume excessive memory.

**Solutions**:

1.  **Limit Container Memory**: Configure memory limits for services in `docker-compose.yml`.
2.  **Node.js Optimization**: Apply Node.js runtime optimizations (e.g., `--max-old-space-size`).

## 🆘 Emergency Commands

### Complete Reset

For persistent or complex issues, a complete reset of the Docker environment can often resolve problems. This involves stopping and removing all containers, volumes, and cached images, followed by a fresh build.

### Quick Diagnostics

- **Service Status**: Check the status of all Docker Compose services.
- **Logs**: Review container logs for errors or warnings.
- **API Health**: Test the API's health endpoint.
- **Database Connectivity**: Verify direct database connectivity.

## 📞 Still Need Help?

If you've exhausted the solutions in this guide:

1.  **Check Logs**: Review detailed logs for relevant error messages.
2.  **Review Documentation**: Revisit the [GoGoTime Documentation Overview](/docs/overview/README) and relevant sections.
3.  **Validate Setup**: Re-follow the [Getting Started Guide](./getting-started.md).
4.  **Check GitHub Issues**: Search for similar problems in the project's issue tracker.
5.  **Create Detailed Issue**: If the problem persists, create a new issue with comprehensive details, including logs, error messages, and steps to reproduce.

---

**SUMMARY**: This troubleshooting guide provides conceptual solutions to common development and operational issues, directing users to relevant resources for more detailed assistance.
