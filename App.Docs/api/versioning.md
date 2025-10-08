# API Versioning Strategy

## Overview

This document outlines the API versioning strategy for the NCY_8 platform, including versioning schemes, backward compatibility policies, deprecation procedures, and client migration strategies.

## Versioning Scheme

### URL Path Versioning

We use URL path versioning as our primary strategy:

```
https://api.ncy-8.com/api/v1/users
https://api.ncy-8.com/api/v2/users
```

**Advantages**:
- Clear and explicit version identification
- Easy to implement and understand
- Supports multiple concurrent versions
- RESTful and cacheable

### Version Format

- **Format**: `v{major}.{minor}`
- **Examples**: `v1`, `v1.1`, `v2`
- **Major Versions**: Breaking changes, new features
- **Minor Versions**: Backward-compatible additions

## Version Lifecycle

### Version States

1. **Development** (`v1.0-dev`): In development, not stable
2. **Beta** (`v1.0-beta`): Feature complete, testing phase
3. **Stable** (`v1.0`): Production ready, fully supported
4. **Deprecated** (`v1.0-deprecated`): Still supported, migration recommended
5. **End of Life** (`v1.0-eol`): No longer supported, removed

### Version Timeline

```
v1.0 (Stable)     v1.1 (Stable)     v2.0 (Stable)
     |                  |                  |
     |-- 6 months --|   |-- 12 months --|  |
     |                  |                  |
     v1.0-deprecated    v1.1-deprecated   v2.0-deprecated
     |                  |                  |
     |-- 6 months --|   |-- 6 months --|   |
     |                  |                  |
     v1.0-eol          v1.1-eol          v2.0-eol
```

## Backward Compatibility

### Compatibility Levels

**Full Compatibility**:
- No breaking changes
- All existing functionality preserved
- New optional fields only
- Response format unchanged

**Partial Compatibility**:
- Some breaking changes with migration path
- Deprecated fields marked but functional
- New required fields with defaults
- Response format evolution

**No Compatibility**:
- Major breaking changes
- Complete API redesign
- New major version required

### Breaking Changes

**What Constitutes Breaking Changes**:

1. **Removing Fields**:
   ```json
   // v1.0
   {
     "id": "123",
     "name": "John",
     "email": "john@example.com"
   }
   
   // v2.0 (Breaking)
   {
     "id": "123",
     "name": "John"
     // email field removed
   }
   ```

2. **Changing Field Types**:
   ```json
   // v1.0
   {
     "age": "25"
   }
   
   // v2.0 (Breaking)
   {
     "age": 25
   }
   ```

3. **Changing Endpoint Behavior**:
   ```typescript
   // v1.0: GET /users returns all users
   // v2.0: GET /users requires organization filter
   ```

4. **Removing Endpoints**:
   ```typescript
   // v1.0: DELETE /users/:id
   // v2.0: Endpoint removed, use DELETE /api/v2/users/:id/archive
   ```

## Deprecation Policy

### Deprecation Process

1. **Announcement** (6 months before removal):
   ```http
   HTTP/1.1 200 OK
   Content-Type: application/json
   X-API-Deprecation: v1.0
   X-API-Sunset: 2024-12-31
   
   {
     "data": {...},
     "deprecation": {
       "version": "v1.0",
       "sunset_date": "2024-12-31",
       "migration_guide": "https://docs.ncy-8.com/migration/v1-to-v2"
     }
   }
   ```

2. **Warning Headers**:
   ```http
   X-API-Warning: 299 - "v1.0 is deprecated, migrate to v2.0"
   ```

3. **Documentation Updates**:
   - Mark endpoints as deprecated
   - Provide migration guides
   - Update client SDKs

4. **Removal**:
   - Endpoint returns 410 Gone
   - Redirect to migration guide

### Deprecation Timeline

| Phase | Duration | Actions |
|-------|----------|---------|
| Announcement | 6 months | Add deprecation headers, update docs |
| Warning | 3 months | Increase warning frequency |
| Final Notice | 1 month | Final migration reminders |
| Removal | - | Endpoint disabled, 410 response |

## Version Negotiation

### Content Negotiation

```http
GET /api/users HTTP/1.1
Accept: application/vnd.ncy-8.v2+json
```

### Default Version

- **Default**: Latest stable version
- **Fallback**: Previous stable version if latest unavailable
- **Error**: 406 Not Acceptable if version not supported

### Version Discovery

```http
GET /api/versions HTTP/1.1

{
  "versions": [
    {
      "version": "v1.0",
      "status": "deprecated",
      "sunset_date": "2024-12-31",
      "endpoints": ["/users", "/organizations"]
    },
    {
      "version": "v2.0",
      "status": "stable",
      "endpoints": ["/users", "/organizations", "/projects"]
    }
  ]
}
```

## Client SDK Versioning

### SDK Version Strategy

```typescript
// SDK versioning
const client = new NCY8Client({
  apiVersion: 'v2.0',
  baseUrl: 'https://api.ncy-8.com'
});

// Automatic version negotiation
const client = new NCY8Client({
  apiVersion: 'auto', // Uses latest stable
  baseUrl: 'https://api.ncy-8.com'
});
```

### SDK Compatibility Matrix

| SDK Version | API v1.0 | API v1.1 | API v2.0 |
|-------------|----------|----------|----------|
| 1.x | ✅ | ✅ | ❌ |
| 2.x | ✅ | ✅ | ✅ |
| 3.x | ❌ | ✅ | ✅ |

## Changelog Management

### Automated Changelog Generation

```yaml
# .github/workflows/changelog.yml
name: Generate Changelog
on:
  release:
    types: [published]
jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Generate Changelog
        run: |
          npx conventional-changelog-cli -p angular -i CHANGELOG.md -s
```

### Changelog Format

```markdown
# Changelog

## [2.0.0] - 2024-01-15

### Added
- New project management endpoints
- Webhook support for real-time updates
- Bulk operations for user management

### Changed
- User creation now requires organization context
- Response format updated for consistency

### Deprecated
- Legacy authentication endpoints (removed in v3.0)

### Removed
- Support for API v1.0 (end of life)

### Fixed
- Pagination cursor handling
- Timezone handling in date fields
```

## Migration Strategies

### Client Migration Guide

```markdown
# Migrating from v1.0 to v2.0

## Breaking Changes

### User Creation
```typescript
// v1.0
POST /api/v1/users
{
  "name": "John Doe",
  "email": "john@example.com"
}

// v2.0
POST /api/v2/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "organization_id": "org_123" // Required
}
```

### Response Format
```typescript
// v1.0
{
  "id": "user_123",
  "name": "John Doe"
}

// v2.0
{
  "data": {
    "id": "user_123",
    "name": "John Doe"
  },
  "meta": {
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

## Migration Steps

1. Update SDK to v2.0 compatible version
2. Update authentication to include organization context
3. Update response parsing to handle new format
4. Test thoroughly in staging environment
5. Deploy with feature flags for gradual rollout
```

### Automated Migration Tools

```typescript
// Migration helper
class APIMigrator {
  async migrateUser(userData: UserData): Promise<User> {
    if (this.apiVersion === 'v1.0') {
      return this.createUserV1(userData);
    } else {
      return this.createUserV2(userData);
    }
  }
  
  async createUserV2(userData: UserData): Promise<User> {
    // Ensure organization_id is present
    if (!userData.organization_id) {
      throw new Error('organization_id required in v2.0');
    }
    return this.api.post('/api/v2/users', userData);
  }
}
```

## Testing Strategy

### Version Compatibility Testing

```typescript
// Version compatibility tests
describe('API Version Compatibility', () => {
  test.each(['v1.0', 'v1.1', 'v2.0'])('should support %s', async (version: string) => {
    const client = new NCY8Client({ apiVersion: version });
    const users = await client.users.list();
    expect(users).toBeDefined();
  });
  
  test('should handle deprecated version warnings', async () => {
    const client = new NCY8Client({ apiVersion: 'v1.0' });
    const response = await client.users.list();
    expect(response.headers['x-api-warning']).toContain('deprecated');
  });
});
```

### Contract Testing

```typescript
// API contract tests
describe('API Contracts', () => {
  test('v2.0 user response contract', async () => {
    const response = await request(app)
      .get('/api/v2/users/user_123')
      .expect(200);
      
    expect(response.body).toMatchSchema({
      type: 'object',
      required: ['data', 'meta'],
      properties: {
        data: {
          type: 'object',
          required: ['id', 'name', 'email']
        },
        meta: {
          type: 'object',
          required: ['created_at']
        }
      }
    });
  });
});
```

## Monitoring & Analytics

### Version Usage Tracking

```typescript
// Version usage metrics
const versionMetrics: Record<string, VersionMetrics> = {
  'v1.0': {
    requests: 15000,
    users: 500,
    endpoints: ['/users', '/organizations']
  },
  'v2.0': {
    requests: 25000,
    users: 800,
    endpoints: ['/users', '/organizations', '/projects']
  }
};
```

### Migration Progress Tracking

```typescript
// Migration dashboard
const migrationStatus: MigrationStatus = {
  total_clients: 1000,
  migrated_to_v2: 750,
  still_on_v1: 250,
  migration_deadline: '2024-12-31',
  progress_percentage: 75
};
```

## Communication Strategy

### Developer Notifications

1. **Email Notifications**: Sent to registered API users
2. **Documentation Updates**: Clear migration guides
3. **SDK Updates**: Automatic deprecation warnings
4. **Community Forums**: Migration support and discussions

### Timeline Communication

```markdown
## API v1.0 Deprecation Timeline

- **January 2024**: Deprecation announced
- **July 2024**: Warning headers added
- **October 2024**: Final migration notice
- **December 2024**: v1.0 end of life

## Migration Support

- Migration guide: https://docs.ncy-8.com/migration/v1-to-v2
- Support forum: https://community.ncy-8.com/api-migration
- Direct support: api-support@ncy-8.com
```

## OpenAPI Documentation Automation

### Automated Spec Generation

The GoGoTime API uses **tsoa** for automated OpenAPI specification generation directly from TypeScript code:

```typescript
// Example: Controller with tsoa decorators
@Route('users')
@Tags('Users')
export class UserController extends Controller {
  @Post('/register')
  @SuccessResponse('200', 'User registered successfully')
  public async registerUser(@Body() requestBody: RegisterUserRequest): Promise<RegisterResponse> {
    // Implementation
  }
}
```

**Benefits**:
- Single source of truth between code and documentation
- Automatic schema generation from TypeScript DTOs
- No manual YAML/JSON maintenance
- Compile-time validation of API contracts

### CI/CD Integration

```yaml
# .github/workflows/api-spec-sync.yml
name: API Spec and SDK Sync
on:
  push:
    paths: ['App.API/src/**']
jobs:
  generate-api-spec:
    runs-on: ubuntu-latest
    steps:
      - name: Generate OpenAPI Spec
        run: cd App.API && yarn api:generate
      - name: Generate Frontend SDK
        run: cd App.Web && yarn api:client
      - name: Commit Updates
        run: git commit -m "chore(api): auto-update OpenAPI spec and SDK"
```

### Frontend SDK Generation

Automatically generates type-safe TypeScript client from OpenAPI spec:

```typescript
// Auto-generated types from OpenAPI
import { paths } from '@/lib/api/client';
import { apiClient } from '@/lib/api/apiClient';

// Type-safe API calls
const result = await apiClient.register({
  email: 'user@example.com',
  password: 'secure123'
});
```

### Documentation Endpoints

| Endpoint | Purpose | Environment |
|----------|---------|-------------|
| `/api/docs` | Interactive Swagger UI | Development |
| `/api/health` | Health check endpoint | All |
| `App.API/swagger.json` | Generated OpenAPI spec | All |
| `App.Web/src/lib/api/client.ts` | Generated TypeScript client | Development |

### Development Workflow

1. **Update API Routes**: Modify controllers with tsoa decorators
2. **Generate Spec**: Run `yarn api:generate` in App.API
3. **Generate Client**: Run `yarn api:client` in App.Web
4. **Validate**: Check TypeScript compilation and tests
5. **Commit**: Changes trigger CI/CD auto-generation

### Validation and Quality Assurance

- **Schema Validation**: JSON schema validation on OpenAPI spec
- **Type Safety**: TypeScript compilation ensures client compatibility
- **Breaking Change Detection**: CI/CD validates changes against previous versions
- **Documentation Review**: Generated docs reviewed in Swagger UI

---

*This versioning strategy ensures smooth API evolution while maintaining backward compatibility and providing clear migration paths for API consumers. The automated OpenAPI generation system maintains documentation accuracy and provides type-safe client SDKs.*
