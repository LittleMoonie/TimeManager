# 🧪 Testing Strategy

## 📋 Overview

Testing is still ramping up in GoGoTime. Tooling is wired in (Jest, Supertest, Vitest, Playwright), but most suites are either stubs or missing entirely. This page explains what exists today and the expectations for contributors when adding coverage.

## 🧱 Current Status

- **Backend (App.API)**
  - Jest is configured and `yarn test` runs, but only `Tests/TestHelper.ts` is present. No endpoint or service specs ship yet.
  - TypeORM migrations and seeds can be exercised in integration tests once suites are created.
  - Goal: add controller/service tests whenever you touch business logic; prefer Supertest against the real Express app to validate routes and middleware.

- **Frontend (App.Web)**
  - Vitest is available, though no `.test.tsx` files exist in `src/`.
  - There is a single Playwright spec (`e2e/login.spec.ts`) that checks the login and forgot password flow.
  - Goal: add component tests alongside new UI code and expand Playwright coverage for critical paths (authentication, timesheets, manager dashboard).

- **CI/CD**
  - No automated workflow runs these suites yet. Developers must execute tests locally and include command output in PRs.

## 🔄 How to Run Tests

```bash
# Backend unit/integration tests (once authored)
cd App.API
yarn test

# Frontend unit tests (once authored)
cd App.Web
yarn test

# Frontend coverage run
cd App.Web
yarn test:coverage

# Playwright E2E (requires web app running or `yarn dev`)
cd App.Web
yarn test:e2e
```

Use `yarn typecheck:web`, `yarn typecheck:api`, and `yarn lint` at the repo root before opening a PR.

## ✍️ Contributing New Tests

1. **Create the spec** next to the code you changed (`*.test.ts`, `*.test.tsx`, or new E2E flow).
2. **Set up fixtures** using `Tests/TestHelper.ts` (backend) or React Testing Library utilities (frontend).
3. **Document assumptions** in the test description—focus on behaviour, not implementation details.
4. **Include results** (command output) in your PR description until CI automation is added.

## 🗺️ Upcoming Work

- Seed example Jest specs for authentication and role services.
- Add Vitest tests for routing guards and layout components.
- Integrate GitHub Actions workflows to enforce linting, type checking, and unit tests on pull requests.
- Expand Playwright suite to cover timesheet creation and manager approval journeys.

---

**SUMMARY**: Testing infrastructure exists but coverage is minimal. Every new feature should arrive with accompanying unit or E2E tests, and contributors must run the suites locally until CI validation is automated.
