# Data to Real Implementation

This document outlines the process of migrating the GoGoTime application from mock data to real, authenticated, user-scoped data.

## Backend Changes

### Database Model Corrections

- **User Entity:**
  - Added `orgId` (UUID), `name` (string), `password` (string).
  - Removed `username`.
  - Updated `role` to be a string instead of an enum.
- **New Entities Created:**
  - `Organization` (id UUID, name)
  - `Team` (id UUID, orgId, name)
  - `TeamMember` (userId, teamId, role)
  - `ActionCode` (id UUID, orgId, code UNIQUE within org, name, type: enum[billable,nonbillable], active)
  - `TimesheetEntry` (id UUID, userId, orgId, actionCodeId, workMode enum[office,remote,hybrid], country, startedAt NULL, endedAt NULL, durationMin INT NOT NULL CHECK >=0, note TEXT, day DATE, createdAt, updatedAt)
  - `Approval` (id UUID, entryId, approverId, status enum[pending,approved,rejected], reason, createdAt, updatedAt)
  - `AuditLog` (id, actorUserId, orgId, entity, entityId, action enum[create,update,delete], diff JSONB, at TIMESTAMPTZ DEFAULT now())
- **Migrations:**
  - Generated `InitialSchema` migration to create all new tables and update existing ones.
  - Generated `AddPasswordToUser` migration to add the `password` column to the `User` entity.

### Auth Plumbing & User Context

- **`expressAuthentication` (src/config/auth.ts):**
  - Updated to properly verify JWT tokens using `jsonwebtoken`.
  - Extracts `id`, `email`, `orgId`, and `role` from the JWT payload.
  - Attaches the authenticated `User` object to the `request`.
- **`UserController` (src/controllers/UserController.ts):**
  - Updated `loginUser` to include `orgId` and `role` in the JWT token.
  - Updated `registerUser` to create an `Organization` and associate the new user with it.
  - Replaced Joi validation with `class-validator`.

### Repositories/Services

- **`TimesheetService` (src/services/timesheetService.ts):**
  - Rewritten to use `TimesheetEntry` entity.
  - Implemented `listByWeek`, `create`, `update`, and `delete` methods.

### Controllers / Routes

- **`TimesheetController` (src/controllers/timesheetController.ts):**
  - Updated to use the new `TimesheetService` methods.
  - Routes now derive `userId` and `orgId` from authentication context.
  - Route paths updated to `/api/v1/time`.

## Frontend Changes

### Removed Mocks & Bound to API

- **Deleted Mock Data Files:**
  - `App.Web/src/lib/api/mockData.ts`
  - `App.Web/src/pages/dashboard/mockData.ts`
- **`tasks.ts` (App.Web/src/lib/api/tasks.ts):**
  - Removed all mock data logic.
- **`auth.ts` (App.Web/src/lib/api/auth.ts):**
  - Removed all mock data logic and updated to use generated `UsersService`.
- **`timesheet.ts` (App.Web/src/lib/api/timesheet.ts):**
  - Rewritten to use generated `TimeService`.
- **`useTimesheet.ts` (App.Web/src/hooks/useTimesheet.ts):**
  - Updated to use new API functions (`createTimeEntry`, `updateTimeEntry`, `deleteTimeEntry`).
  - Removed `sendDay` and `autoSend` mutations.
  - Fixed `helpers` object calculation.
- **`TimesheetPage.tsx` (App.Web/src/pages/timesheet/index.tsx):**
  - Removed mock data logic and old mutations.
  - Fixed `useEffect` for `codeIds` and `dailyTotals` calculations.
- **`WeekGridView.tsx` (App.Web/src/pages/timesheet/WeekGridView.tsx):**
  - Removed unused props and functions related to mock data.
  - Fixed `computeDayMinutes`, `getCellEntry`, and `rowTotals` calculations.
- **`DayLogView.tsx` (App.Web/src/pages/timesheet/DayLogView.tsx):**
  - Removed unused props and functions related to mock data.

## Next Steps

- Implement `ActionCodeService.search({ orgId, q })` in the backend.
- Implement `getCurrentUser` in `auth.ts` (frontend) using the generated `UsersService`.
- Implement `useTimesheetHistory` in `useTimesheet.ts` (frontend).
- Implement manager-only routes and RBAC checks.
- Implement data validation and business rules (weekend restriction, overtime, etc.) in the backend.
- Implement audit logging and metrics.
- Write integration and e2e tests.
