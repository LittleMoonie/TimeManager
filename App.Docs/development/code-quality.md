# Code Quality Standards

## Overview

This document defines the code quality standards, development practices, and tooling configuration for the NCY_8 project. Our goal is to maintain high code quality, consistency, and developer productivity through automated tooling and clear guidelines.

## Monorepo Structure

### Yarn Workspace Configuration

Our project utilizes Yarn workspaces for managing multiple packages within a single repository. This allows for shared dependencies, simplified development, and consistent tooling across `App.API` and `App.Web`.

```json
// package.json (root)
{
  "private": true,
  "workspaces": [
    "App.API",
    "App.Web"
  ],
  "scripts": {
    "dev": "concurrently \"yarn workspace App.Web dev\" \"yarn workspace App.API dev\"",
    "build": "yarn workspaces run build",
    "test": "yarn workspaces run test",
    "lint": "yarn workspaces run lint",
    "typecheck": "yarn workspaces run typecheck"
  }
}
```

### Package Management

- **Package Manager**: yarn for efficient dependency management
- **Workspace Dependencies**: Shared dependencies at root level
- **Version Management**: Changesets for coordinated versioning
- **Lock File**: yarn.lock for reproducible builds

## Code Formatting & Linting

### ESLint Configuration

Our ESLint configuration is defined in `eslint.config.js` files at the root of `App.API` and `App.Web` directories. This allows for tailored linting rules for each part of the monorepo.

```javascript
// App.API/eslint.config.js (Simplified)
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default [
  { files: ["**/*.{js,ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    rules: {
      // Custom rules or overrides
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off", // Often inferred
    },
  },
];
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Git Workflow & Commit Standards

### Conventional Commits

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(auth): add OIDC authentication support
fix(api): resolve user creation validation error
docs(readme): update installation instructions
refactor(database): optimize user query performance
```

### Commitlint Configuration

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor', 
      'test', 'chore', 'perf', 'ci', 'build'
    ]],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case']],
    'subject-max-length': [2, 'always', 72]
  }
};
```

## Pre-commit Hooks

### Husky Configuration

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

### lint-staged Configuration

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

## Code Review Guidelines

### Review Checklist

**Functionality**:
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Performance considerations addressed

**Code Quality**:
- [ ] Code is readable and well-documented
- [ ] No code duplication
- [ ] Appropriate abstractions used
- [ ] SOLID principles followed

**Testing**:
- [ ] Unit tests cover new functionality
- [ ] Integration tests updated if needed
- [ ] Test coverage maintained
- [ ] Tests are meaningful and not brittle

**Security**:
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] Dependencies are secure

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Peer Review**: At least one team member review
3. **Architecture Review**: Major changes require architecture review
4. **Security Review**: Security-sensitive changes require security review

## Testing Standards

### Test Structure

```
tests/
├── unit/                 # Unit tests
│   ├── components/      # Component tests
│   ├── services/        # Service tests
│   └── utils/           # Utility tests
├── integration/         # Integration tests
│   ├── api/            # API endpoint tests
│   └── database/       # Database tests
├── e2e/                # End-to-end tests
│   ├── auth/           # Authentication flows
│   └── user-journeys/  # User journey tests
└── fixtures/           # Test data and fixtures
```

### Test Naming Conventions

```javascript
// Unit tests
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {});
    it('should throw error with invalid email', () => {});
    it('should hash password before saving', () => {});
  });
});

// Integration tests
describe('POST /api/v1/users', () => {
  it('should create user and return 201', () => {});
  it('should return 400 for invalid data', () => {});
  it('should return 401 without authentication', () => {});
});
```

### Coverage Requirements

- **Minimum Coverage**: 80% line coverage
- **Critical Paths**: 95% coverage for authentication, payment, data access
- **New Code**: 90% coverage requirement
- **Coverage Reports**: Generated in CI and reviewed

## Documentation Standards

### Code Documentation

**JSDoc for Functions**:
```typescript
/**
 * Creates a new user account with the provided data
 * @param userData - User registration data (CreateUserDto)
 * @returns Promise resolving to the created user
 * @throws {UnprocessableEntityError} When user data is invalid or email already exists
 * @throws {NotFoundError} If related entities (e.g., default status) are not found
 */
async function createUser(
  userData: CreateUserDto,
): Promise<User> {
  // Implementation
}
```

**README for Components**:
```markdown
# UserProfile Component

A reusable component for displaying and editing user profile information.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| user | User | Yes | User object to display |
| editable | boolean | No | Whether the profile is editable |

## Usage

```tsx
<UserProfile user={user} editable={true} />
```
```

### Architecture Decision Records (ADRs)

Store ADRs in `docs/adr/` directory:

```markdown
# ADR-001: Database ORM Selection

## Status
Accepted

## Context
We need to choose an ORM for our Node.js backend.

## Decision
We will use TypeORM as our ORM.

## Consequences
- Type-safe database access
- Excellent migration system
- Good developer experience
- Additional dependency to maintain
```

## Performance Standards

### Bundle Size Limits

- **Frontend Bundle**: < 500KB gzipped
- **Individual Chunks**: < 200KB gzipped
- **Vendor Chunks**: < 300KB gzipped

### Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

### Monitoring

```javascript
// Performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Security Standards

### Dependency Management

- **Regular Updates**: Dependencies updated monthly
- **Security Scanning**: Automated vulnerability scanning
- **License Compliance**: All dependencies must have compatible licenses
- **Minimal Dependencies**: Avoid unnecessary dependencies

### Code Security

Input validation is critical for security. We use `class-validator` decorators on our DTOs to ensure incoming data adheres to expected formats and constraints.

```typescript
// Input validation with class-validator (example from DTO)
import { IsEmail, IsString, MinLength, IsNotEmpty } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;
}
```

Sanitization is applied where user-generated content might be rendered to prevent XSS attacks.

```typescript
// Sanitization (conceptual example)
import { sanitize } from 'dompurify';

const userInput = "<script>alert('xss')</script>";
const sanitizedHtml = sanitize(userInput);
```

## Automation & CI/CD

### Quality Gates

```yaml
# .github/workflows/quality.yml
name: Code Quality
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'
      - run: yarn install
      - run: yarn lint
      - run: yarn type-check
      - run: yarn test
      - run: yarn test:e2e
      - run: yarn build
```

### Automated Checks

- **Linting**: ESLint with auto-fix
- **Formatting**: Prettier with auto-format
- **Type Checking**: TypeScript strict mode
- **Testing**: Unit, integration, and E2E tests
- **Security**: Dependency and code scanning
- **Performance**: Bundle analysis and metrics

## Development Environment

### IDE Configuration

**VS Code Settings**:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "eslint.workingDirectories": ["App.Web", "App.API"]
}
```

**Recommended Extensions**:
- ESLint
- Prettier
- TypeScript Importer
- GitLens
- Thunder Client (API testing)

### Development Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"yarn --filter App.Web dev\" \"yarn --filter App.API dev\"",
    "build": "yarn --filter App.Web build && yarn --filter App.API build",
    "test": "yarn --filter App.Web test && yarn --filter App.API test",
    "lint": "yarn --filter App.Web lint && yarn --filter App.API lint",
    "type-check": "yarn --filter App.Web type-check && yarn --filter App.API type-check",
    "clean": "yarn --filter App.Web clean && yarn --filter App.API clean"
  }
}
```

## Monitoring & Metrics

### Code Quality Metrics

- **Cyclomatic Complexity**: < 10 per function
- **Cognitive Complexity**: < 15 per function
- **Lines of Code**: < 300 per file
- **Test Coverage**: > 80% overall
- **Technical Debt**: Tracked and addressed quarterly

### Quality Dashboard

```javascript
// Quality metrics collection
const qualityMetrics = {
  testCoverage: getTestCoverage(),
  codeComplexity: getCodeComplexity(),
  technicalDebt: getTechnicalDebt(),
  securityIssues: getSecurityIssues(),
  performanceMetrics: getPerformanceMetrics()
};
```

## Continuous Improvement

### Regular Reviews

- **Monthly**: Code quality metrics review
- **Quarterly**: Tooling and process evaluation
- **Annually**: Standards and guidelines update

### Feedback Loop

- **Developer Surveys**: Quarterly feedback collection
- **Retrospectives**: Sprint-based process improvement
- **Metrics Analysis**: Data-driven quality improvements

---

*This document is maintained by the engineering team and updated based on team feedback and industry best practices.*
