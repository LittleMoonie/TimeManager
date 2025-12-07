# Changelog

## [1.0.0] - 2025-10-10

### Added

- Initial implementation of real, authenticated, user-scoped data end-to-end.
- New database entities: `Company`, `Team`, `TeamMember`, `ActionCode`, `TimesheetEntry`, `Approval`, `AuditLog`.
- Database migrations for all new and modified tables.
- Seed script for development data.
- Frontend API client generation.

### Changed

- Refactored `User` entity to include `orgId`, `name`, `password`, and `role` as string.
- Updated `AuditLog` entity to match new requirements.
- Rewritten `TimesheetService` to use `TimesheetEntry` entity and new API methods.
- Updated `TimesheetController` to use new `TimesheetService` and authentication context.
- Updated `expressAuthentication` middleware for JWT verification.
- Updated `UserController` for new `User` entity and `class-validator`.
- Removed all mock data and related logic from frontend (`tasks.ts`, `auth.ts`, `timesheet.ts`).
- Updated frontend hooks (`useTimesheet`) and components (`TimesheetPage`, `WeekGridView`, `DayLogView`) to use real API data.

### Removed

- Old mock data files (`mockData.ts`).
- Old `Timesheet` and `TimeEntry` entities.
- Joi validation from `UserController`.
- Unused props and functions from frontend components.
