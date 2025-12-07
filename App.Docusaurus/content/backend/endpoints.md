# 🚀 GoGoTime API Endpoints

This document provides a high-level overview of the available API endpoints, categorized by their primary function. For detailed specifications, including request/response schemas, parameters, and examples, please refer to the interactive Swagger UI documentation.

## 🎯 How to Interact with Endpoints

All API interactions are performed over HTTP/HTTPS. Requests should be sent to the appropriate base URL (e.g., `http://localhost:4000/api` for development) followed by the endpoint path. Responses are typically in JSON format.

### Base URLs

| Environment | Base URL                               | Interactive Docs (Swagger UI)               |
| ----------- | -------------------------------------- | ------------------------------------------- |
| Development | `http://localhost:4000/api`            | `http://localhost:4000/api/docs`            |
| Staging     | `https://api-staging.gogotime.com/api` | `https://api-staging.gogotime.com/api/docs` |
| Production  | `https://api.gogotime.com/api`         | _Not Available_                             |

### Authentication

Most endpoints require authentication. Please refer to the [Authentication & Authorization](./authentication.md) documentation for details on how to obtain and use JWT Bearer tokens.

## 📋 Endpoint Categories

### 👤 User Management

Endpoints related to user registration, authentication, profile management, and session control.

- **Registration**: Create new user accounts.
- **Authentication**: Log in users and obtain JWT tokens.
- **Profile**: Retrieve and update user profile information.
- **Sessions**: Manage active user sessions.

### 🏢 Company Management

Endpoints for managing companies, their settings, and associated resources.

- **Company Profiles**: Create, retrieve, update, and delete company information.
- **Company Settings**: Configure company-specific settings.
- **Teams**: Manage teams within a company.

### ⏰ Timesheet Management

Endpoints for creating, managing, and approving timesheet entries.

- **Timesheet Entries**: Create, retrieve, update, and delete individual timesheet entries, including lifecycle transitions (`saved → pending → approved → invoiced`) and rejection flows.
- **Timesheet Approvals**: Manage the approval workflow for timesheets.
- **Action Codes**: Define and manage action codes for timesheet entries.

### ⚙️ System & Health

Endpoints for monitoring the API's health and system status.

- **Health Check**: Verify the operational status of the API.
- **OpenAPI Generation**: Trigger manual OpenAPI specification generation (development only).

### 🔑 Role & Permission Management

Endpoints for defining and assigning roles and permissions within the system.

- **Roles**: Create, retrieve, update, and delete user roles.
- **Permissions**: Manage granular permissions associated with roles.

## 📖 Detailed Endpoint Specifications

For a complete and interactive list of all API endpoints, their parameters, request/response models, and example usage, please visit the **Swagger UI documentation** in your development environment:

**[http://localhost:4000/api/docs](http://localhost:4000/api/docs)**

This interactive documentation is automatically generated from our backend code, ensuring it is always up-to-date with the latest API changes.

---

**SUMMARY**: The GoGoTime API provides a comprehensive set of endpoints for managing all aspects of the platform. While this document offers a high-level overview, the Swagger UI remains the definitive source for detailed and interactive API exploration.
