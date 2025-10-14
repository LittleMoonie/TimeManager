# Code Quality Standards

## Overview

This document defines the code quality standards, development practices, and tooling configuration for the NCY_8 project. Our goal is to maintain high code quality, consistency, and developer productivity through automated tooling and clear guidelines.

## Structure

### Yarn Workspace Configuration

Our project utilizes Yarn workspaces for managing multiple packages within a single repository. This allows for shared dependencies, simplified development, and consistent tooling across `App.API` and `App.Web`.

```json
// package.json (root)
{
  "name": "gogotime",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["App.API", "App.Web"],
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "prepare": "husky install",
    "format": "prettier --write \"./**/*.{ts,tsx,js,jsx,json,md,yml,yaml}\" --ignore-path .gitignore --config ./.prettierrc.json"
  },
  "devDependencies": {
    "@commitlint/cli": "^20.1.0",
    "@commitlint/config-conventional": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^8.3.0",
    "@typescript-eslint/parser": "^8.3.0",
    "eslint": "^9.7.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.31.0",
    "eslint-plugin-promise": "^7.0.0",
    "eslint-plugin-react": "^7.34.3",
    "eslint-plugin-react-hooks": "^4.6.2",
    "husky": "^9.1.7",
    "lint-staged": "^15.2.7",
    "pinst": "^3.0.0",
    "prettier": "^3.3.3"
  },
  "packageManager": "yarn@4.10.3"
}
```

### Package Management

- **Package Manager**: yarn for efficient dependency management
- **Workspace Dependencies**: Shared dependencies at root level
- **Version Management**: Changesets for coordinated versioning
- **Lock File**: yarn.lock for reproducible builds

## Code Formatting & Linting

### ESLint Configuration

Our ESLint configuration is now unified at the root in `eslint.config.js`. This single configuration applies to both `App.API` and `App.Web` workspaces, ensuring consistent linting rules across the entire project. Individual workspaces reference this root configuration.

```javascript
// eslint.config.js (Root)
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';
import { fixupConfigRules } from '@eslint/compat';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPromise from 'eslint-plugin-promise';

export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  {
    languageOptions: {
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...fixupConfigRules(pluginReactConfig),
  eslintPluginPrettierRecommended,
  {
    plugins: {
      'react-hooks': eslintPluginReactHooks,
      import: eslintPluginImport,
      promise: eslintPluginPromise,
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'promise/always-return': 'error',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-native': 'off',
      'promise/no-nesting': 'warn',
      'promise/no-promise-in-callback': 'warn',
      'promise/no-callback-in-promise': 'warn',
      'promise/avoid-new': 'warn',
      'promise/no-new-statics': 'error',
      'promise/no-return-in-finally': 'warn',
      'promise/valid-params': 'warn',
    },
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
```

### Prettier Configuration

Our Prettier configuration is defined at the root in `.prettierrc.json`. This ensures consistent code formatting across all files in both `App.API` and `App.Web` workspaces.

```json
// .prettierrc.json (Root)
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100
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

### Branch Naming Conventions

To maintain a clean and organized Git history, please adhere to the following branch naming conventions:

*   **Prefixes**: Start your branch name with a type that indicates its purpose.
    *   `feat/`: For new features (e.g., `feat/user-profile-page`)
    *   `fix/`: For bug fixes (e.g., `fix/login-button-not-working`)
    *   `docs/`: For documentation updates (e.g., `docs/update-api-endpoints`)
    *   `refactor/`: For code refactoring (e.g., `refactor/extract-auth-service`)
    *   `chore/`: For maintenance tasks or minor changes (e.g., `chore/update-dependencies`)
    *   `hotfix/`: For urgent bug fixes in production (e.g., `hotfix/critical-security-patch`)
    *   `release/`: For release preparation (e.g., `release/v1.0.0`)
*   **Descriptive**: Be clear and concise about the branch's purpose.
*   **Kebab-case**: Use hyphens (`-`) to separate words (e.g., `feat/add-user-settings`).
*   **Issue Numbers (Optional but Recommended)**: If applicable, include the issue number (e.g., `feat/issue-123-implement-dark-mode`).

### Commit Messages (Conventional Commits)

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This project also enforces a detailed commit body structure to ensure clarity and context.

**Structure**:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**1. Type (Mandatory)**:
This describes the kind of change. Common types include:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semicolons, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- `ci`: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

**2. Scope (Optional)**:
Provides additional contextual information (e.g., `feat(authentication)` or `fix(api-gateway)`).

**3. Description (Mandatory)**:
A short, imperative, present tense summary of the change (max 50-72 characters). No period at the end.

**4. Body (Mandatory - Enforced by Commitlint)**:
A longer explanation of the commit message, structured into "What", "Why", "How", and "Impact" sections. This is enforced by `commitlint`.

*   **What**: Describe *what* specifically changed in this commit.
*   **Why**: Explain the *motivation* for the change, linking to issues if applicable.
*   **How**: Summarize *how* the change was implemented (high-level technical details).
*   **Impact**: Mention any side effects, breaking changes, or important implications.

**5. Footer (Optional)**:
Used for referencing issues (e.g., `Closes #123`, `Fixes #456`) or indicating breaking changes (e.g., `BREAKING CHANGE: <description>`).

**Examples**:

```bash
feat(auth): add OIDC authentication support

What:
- Integrated OIDC provider for single sign-on.
- Added new configuration options for client ID and secret.

Why:
- To allow users to log in using their corporate identities.
- Improves security and user experience by reducing password fatigue.

How:
- Used 'passport-openidconnect' strategy.
- Created new authentication flow in AuthenticationService.

Impact:
- New environment variables required for OIDC configuration.
- Users can now choose OIDC login option.
```

**Example of a full commit command:**

```bash
git commit -m "feat(user): implement user profile update

What:
- Added API endpoint PUT /api/v1/users/{id} to update user profile.
- Implemented UserService.updateUser method to handle business logic.
- Updated UserDto with validation rules for profile fields.

Why:
- Users need to be able to update their personal information.
- Centralized update logic ensures data consistency and validation.

How:
- Created new DTO UpdateUserDto for incoming data.
- Used TypeORM repository to find and save user entity.
- Integrated class-validator for input validation.

Impact:
- New API endpoint available for frontend to consume.
- Requires frontend integration for user profile forms.
- No database schema changes required."
```

### Commitlint Configuration

Our Commitlint configuration is defined at the root in `commitlint.config.cjs`. It extends `@commitlint/config-conventional` and includes a custom plugin to enforce the "What/Why/How/Impact" sections in commit messages.

```javascript
// commitlint.config.cjs (Root)
module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'body-requires-what-why-how': ({ body }) => {
          if (!body) {
            return [false, 'Commit body is required with What, Why, How, Impact sections.'];
          }

          const hasWhat = /(^|\n)What\s*:/i.test(body);
          const hasWhy = /(^|\n)Why\s*:/i.test(body);
          const hasHow = /(^|\n)How\s*:/i.test(body);
          const hasImpact = /(^|\n)Impact\s*:/i.test(body);

          if (!hasWhat || !hasWhy || !hasHow || !hasImpact) {
            return [false, 'Commit body must include sections:\nWhat:\nWhy:\nHow:\nImpact:'];
          }
          return [true];
        },
      },
    },
  ],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'test', 'perf', 'ci', 'build'],
    ],
    'subject-empty': [2, 'never'],
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
    'body-requires-what-why-how': [2, 'always'],
  },
};
```

## Pre-commit Hooks

### Husky Configuration

Husky hooks are configured through individual script files located in the `.husky/` directory at the root.

#### `pre-commit` Hook

This hook runs `lint-staged` to format and lint staged files, blocks commits on protected branches, scans for secrets, and performs type-checking and optional tests.

```bash
#!/usr/bin/env bash
# bootstrap: re-exec in bash if we’re not already there
[ -z "${BASH_VERSION:-}" ] && exec /usr/bin/env bash "$0" "$@"

# ------------------------------------------
# 🧩 Husky pre-commit hook — GoGoTime
# Runs staged checks, blocks secrets, enforces branch policy,
# formats & lints code, typechecks & optional tests
# ------------------------------------------
# 🚫 forbid commits directly on protected branches
PROTECTED_BRANCHES=("origin/main" "origin/develop" "main" "develop")
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo HEAD)"

for BR in "${PROTECTED_BRANCHES[@]}"; do
  if [[ "$CURRENT_BRANCH" == "$BR" ]]; then
    echo ""
    echo "🛑  You are on protected branch '$BR'"
    echo "    Commits are not allowed directly on this branch."
    echo "    Please create a feature branch instead:"
    echo ""
    echo "      git checkout -b feat/<something>"
    echo ""
    exit 1
  fi
done

# make sure we’re in bash (dash chokes on pipefail)
if [ -z "${BASH_VERSION:-}" ]; then
  echo "❌ Please run this hook with bash (not sh)."
  exit 1
fi

set -Eeuo pipefail

# --- Pretty helpers ---
red()  { printf "\033[31m%s\033[0m\n" "$*"; }
grnc()  { printf "\033[32m%s\033[0m\n" "$*"; }
ylw()  { printf "\033[33m%s\033[0m\n" "$*"; }
blu()  { printf "\033[34m%s\033[0m\n" "$*"; }
abort(){ red "❌ $*"; exit 1; }
note() { blu "ℹ️  $*"; }
ok()   { grn "✅ $*"; }
warn() { ylw "⚠️  $*"; }

# --- Detect staged files ---
STAGED_FILES="$(git diff --cached --name-only --diff-filter=ACMR)"
[ -z "$STAGED_FILES" ] && { note "No staged files. Skipping."; exit 0; }

echo ""
blu "───────────────────────────────────────────────"
blu "🔍  GoGoTime Pre-commit Checks"
blu "───────────────────────────────────────────────"
echo ""

# --- 1) Branch policy ---
BRANCH="$(git rev-parse --abbrev-ref HEAD || echo 'HEAD')"
case "$BRANCH" in
  main|master|develop|release/*|hotfix/*|feat/*|fix/*|chore/*) : ;;
  *) warn "Branch '$BRANCH' violates naming policy."
     [ "${SKIP_BRANCH_CHECK:-0}" = "1" ] || abort "Rename your branch or set SKIP_BRANCH_CHECK=1"
     ;;
esac
ok "Branch ok → $BRANCH"

# --- 2) Banned files (secrets, keys, dumps) ---
BANNED='(^|/)(\.env(\..*)?$|.*\.pem$|.*\.p12$|.*\.key$|.*\.crt$|id_rsa$|id_ed25519$|.*\.kdbx$|.*\.sqlite$|.*\.db$|.*\.dump$)'
if echo "$STAGED_FILES" | grep -E "$BANNED" -q; then
  echo "$STAGED_FILES" | grep -E "$BANNED" | sed 's/^/   • /'
  abort "Sensitive or binary file detected."
fi
ok "No banned files."

# --- 3) Secret scan in diff (show file + line + snippet) ---
note "Scanning staged diff for secrets…"

DIFF_CACHED="$(git diff --cached --unified=0 || true)"
SECRET_RE='(AWS_SECRET_ACCESS_KEY|AWS_ACCESS_KEY_ID|BEGIN RSA PRIVATE KEY|BEGIN PRIVATE KEY|xox[baprs]-[0-9A-Za-z-]{10,}|ghp_[0-9A-Za-z]{36,}|gho_[0-9A-Za-z]{36,}|password\\s*[:=]\\s*["'A-Za-z0-9!@#$%^&*()_+=-\\\\-]+|secret\\s*[:=]\\s*["'A-Za-z0-9!@#$%^&*()_+=-\\\\-]+|token\\s*[:=]\\s*["'A-Za-z0-9!@#$%^&*()_+=-\\\\-]+)'

# whitelist obvious safe paths (examples, docs)
SAFE_ENV='(^|/)(\.env\.example$|\.env\.sample$|example\.env$|README|docs/)'

# build list of staged files once
FILES=$(echo "$FILES" | grep -vE '^\\.husky/pre-commit$' || true)

FOUND=0
for f in $FILES; do
  # only scan textual files
  if [ ! -f "$f" ] || file --mime "$f" | grep -q binary; then
    continue
  fi

  # scan diff for this file
  # use grep to catch pattern, showing line and context
  if git diff --cached -U0 -- "$f" | grep -Ein --color=never "$SECRET_RE" > /tmp/secret_hits.txt 2>/dev/null; then
    if [ $FOUND -eq 0 ]; then
      echo ""
      red "❌ Potential secrets detected!"
      FOUND=1
    fi
    echo ""
    ylw "File: $f"
    cat /tmp/secret_hits.txt | sed 's/^/   ⚠ /'
    rm -f /tmp/secret_hits.txt
  fi
done

if [ $FOUND -eq 1 ]; then
  echo ""
  abort "Remove or mask these secrets before committing."
fi

ok "No secrets found (or only in safe example files)."

# --- 4) Large non-asset files (>1MB) ---
MAX=$((1024*1024))
ALLOW_ASSET='\\.(png|jpg|jpeg|gif|svg|webp|mp4|mov|pdf)$'
while IFS= read -r f; do
  [ -f "$f" ] || continue
  echo "$f" | grep -Eiq "$ALLOW_ASSET" && continue
  size=$(stat -c%s "$f" 2>/dev/null || echo 0)
  if [ "$size" -gt "$MAX" ]; then
    warn "File too large: $f ($size bytes)"
    abort "Use Git LFS or compress before committing."
  fi
done <<<"$STAGED_FILES"
ok "No oversized files."

# --- 5) Block TODO!/FIXME!/HACK! markers ---
if printf "%s" "$DIFF_CACHED" | grep -E '(\\bTODO!\\b|\\bFIXME!\\b|\\bHACK!\\b)' -q; then
  printf "%s" "$DIFF_CACHED" | grep -En '(\\bTODO!\\b|\\bFIXME!\\b|\\bHACK!\\b)' | sed 's/^/   • /'
  abort "Remove TODO!/FIXME!/HACK! markers."
fi
ok "No blocking markers."

# --- 6) Lint + Format (Yarn 4 PnP safe) ---
note "Running lint-staged (format + lint)…"
yarn dlx lint-staged --concurrent false || abort "Lint/format failed."
ok "Lint/format passed."

# --- 7) Type-check staged TS files ---
run_ts() {
  local cfg="$1"
  [ -f "$cfg" ] || return 0
  note "Type-checking: $cfg"
  yarn dlx tsc -p "$cfg" --noEmit || abort "Type errors detected → $cfg"
}
if echo "$STAGED_FILES" | grep -E '^App\\.Web/.*\\.(ts|tsx)$' -q; then
  run_ts "App.Web/tsconfig.json"
fi
if echo "$STAGED_FILES" | grep -E '^App\\.API/.*\\.(ts|tsx)$' -q; then
  [ -f "App.API/tsconfig.json" ] && run_ts "App.API/tsconfig.json" || run_ts "App.API/tsconfig.build.json"
fi
ok "Typecheck OK (or not needed)."

# --- 8) Optional tests ---
if [ "${SKIP_TESTS:-0}" != "1" ]; then
  if echo "$STAGED_FILES" | grep -E '^App\\.Web/(src|test)/' -q && (cd App.Web && yarn -s test --help >/dev/null 2>&1); then
    note "Running App.Web tests…"
    (cd App.Web && yarn -s test --run || yarn -s test) || abort "App.Web tests failed."
  fi
  if echo "$STAGED_FILES" | grep -E '^App\\.API/' -q && (cd App.API && yarn -s test --help >/dev/null 2>&1); then
    note "Running App.API tests…"
    (cd App.API && yarn -s test) || abort "App.API tests failed."
  fi
else
  warn "Skipping tests (SKIP_TESTS=1)."
fi

echo ""
grn "✨ All pre-commit checks passed. Great job!"
echo ""
```

#### `commit-msg` Hook

This hook enforces Conventional Commits and the custom "What/Why/How/Impact" structure using `commitlint`.

```bash
#!/bin/sh
# Enforce Conventional Commit structure + What/Why/How/Impact sections
# Called by Git with the commit message file path as $1

MSGFILE="$1"

# Verify commitlint is installed
if ! command -v yarn >/dev/null 2>&1; then
  echo "❌ Yarn not found. Please install dependencies before committing."
  exit 1
fi

# Run commitlint validation
echo "🔍 Validating commit message format…"
if ! yarn dlx commitlint --edit "$MSGFILE"; then
  echo ""
  echo "🛑 Commit message validation failed."
  echo "Your commit message must follow the structure:"
  echo ""
  echo "  <type>: short summary"
  echo ""
  echo "  What:"
  echo "  - Describe what changed"
  echo ""
  echo "  Why:"
  echo "  - Explain the motivation"
  echo ""
  echo "  How:"
  echo "  - Summarize how it was done"
  echo ""
  echo "  Impact:"
  echo "  - Mention side effects or important implications"
  echo ""
  echo "Example:"
  echo ""
  echo "  feat: add leave request approval panel"
  echo ""
  echo "  What:"
  echo "  - Added approval UI and backend endpoint integration"
  echo ""
  echo "  Why:"
  echo "  - Needed a way for managers to handle requests"
  echo ""
  echo "  How:"
  echo "  - Created LeaveRequestPanel.tsx and linked to service"
  echo ""
  echo "  Impact:"
  echo "  - Requires DB migration for new approval status"
  echo ""
  exit 1
fi

echo "✅ Commit message passed linting."
exit 0
```

### lint-staged Configuration

Our `lint-staged` configuration is defined at the root in `.lintstagedrc.mjs`. It specifies which commands to run on staged files based on their location and type, ensuring that only relevant files are processed and root configuration files are skipped.

```javascript
// .lintstagedrc.mjs (Root)
export default {
  // Lint and format TypeScript and JavaScript files in App.API and App.Web
  'App.{API,Web}/**/*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
  // Format other files in App.API and App.Web
  'App.{API,Web}/**/*.{json,md,yml,yaml}': ['prettier --write'],
  // Exclude root-level configuration files from linting/formatting
  '!{.prettierrc.json,package.json,yarn.lock,eslint.config.js,.lintstagedrc.mjs}': [
    // No actions for these files, they are explicitly skipped
  ],
};
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
async function createUser(userData: CreateUserDto): Promise<User> {
  // Implementation
}
```

**README for Components**:

````markdown
# UserProfile Component

A reusable component for displaying and editing user profile information.

## Props

| Prop     | Type    | Required | Description                     |
| -------- | ------- | -------- | ------------------------------- |
| user     | User    | Yes      | User object to display          |
| editable | boolean | No       | Whether the profile is editable |

## Usage

```tsx
<UserProfile user={user} editable={true} />
```
````

````

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
````

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
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

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
  performanceMetrics: getPerformanceMetrics(),
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

_This document is maintained by the engineering team and updated based on team feedback and industry best practices._
