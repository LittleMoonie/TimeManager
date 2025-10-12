# Timesheet History Module

This document outlines the design and functionality of the Timesheet History module, which provides an auditable log of significant events related to timesheets within the GoGoTime application.

## Overview

The Timesheet History module captures every critical event on timesheets and related entities, including creation, updates, deletions of timesheet entries and action codes, week submissions, approvals, rejections, auto-sends, weekend permit grants/revocations, and retro-edit toggles. This ensures a comprehensive audit trail for compliance and operational transparency.

## Database: `timesheet_history` Table

All historical events are stored in the `timesheet_history` table. This table is designed for efficient querying and includes mechanisms for ensuring data integrity and idempotency.

### Columns

| Column Name      | Type                 | Description                                                               |
| :--------------- | :------------------- | :------------------------------------------------------------------------ |
| `id`             | `UUID`               | Primary Key, auto-generated.                                              |
| `orgId`          | `UUID`               | Foreign Key to `Company.id`.                                         |
| `userId`         | `UUID`               | Subject user whose timesheet is affected. Foreign Key to `user.id`.       |
| `actorUserId`    | `UUID` (nullable)    | User who performed the action. Foreign Key to `user.id`. Nullable for system jobs. |
| `entityType`     | `TEXT` (ENUM-like)   | Type of the affected entity: `TimesheetEntry`, `TimesheetWeek`, `Approval`, `Permit`, `ActionCode`. |
| `entityId`       | `UUID`               | ID of the affected entity.                                                |
| `action`         | `TEXT` (ENUM-like)   | Specific action performed: `created`, `updated`, `deleted`, `submitted`, `approved`, `rejected`, `auto_sent`, `permit_granted`, `permit_revoked`, `retro_edit_enabled`, `retro_edit_disabled`, `action_code_created`, `action_code_updated`, `action_code_deleted`. |
| `fromStatus`     | `TEXT` (nullable)    | Previous status of the entity (if applicable).                            |
| `toStatus`       | `TEXT` (nullable)    | New status of the entity (if applicable).                                 |
| `reason`         | `TEXT` (nullable)    | Reason for the action, supplied by user/manager.                          |
| `diff`           | `JSONB` (nullable)   | Patch-like object `{before:{}, after:{}}` or list of changed fields.     |
| `metadata`       | `JSONB` (nullable)   | Additional context (e.g., `{ source:'api|ui|system', ip:'', userAgent:'', entryDay:'2025-10-06' }`). |
| `occurredAt`     | `TIMESTAMPTZ`        | Timestamp of when the event occurred, defaults to `now()`.                |
| `hash`           | `TEXT` (nullable)    | SHA256 hash of normalized payload for idempotency.                        |
| `createdAt`      | `TIMESTAMPTZ`        | Timestamp of record creation, defaults to `now()`.                        |

### Indexes

*   `idx_tsh_org_user_time` on `(orgId, userId, occurredAt DESC)`
*   `idx_tsh_org_entity` on `(orgId, entityType, entityId, occurredAt DESC)`
*   `idx_tsh_hash` unique nullable index on `(hash)` WHERE `hash IS NOT NULL`

### Constraints

*   `entityType` and `action` columns have `ENUM-like` check constraints against allowed values.
*   Foreign key cascades are set to `RESTRICT` for deletes.

## API Routes

### `GET /api/v1/timesheet-history`

Retrieves a paginated list of timesheet history events. Results are scoped based on the user's role:

*   **Employees:** Can only view their own history.
*   **Managers/Admins:** Can view Company-wide history.

**Query Parameters:**

*   `entityType?`: Filter by entity type (`TimesheetEntry`, `TimesheetWeek`, `Approval`, `Permit`, `ActionCode`).
*   `entityId?`: Filter by the UUID of the affected entity.
*   `userId?`: Filter by the subject user's ID (ignored for employees).
*   `from?`, `to?`: Filter by `occurredAt` timestamp range (ISO datetime).
*   `action?`: Filter by specific actions (array of `TimesheetHistoryAction`).
*   `limit?`: Pagination limit (1-200, default 50).
*   `cursor?`: Opaque string for keyset pagination.

### `GET /api/v1/timesheet-history/entity/:entityType/:entityId`

Convenience endpoint to fetch history for a specific entity.

## Integration with Services

Other services are responsible for calling `TimesheetHistoryService.recordEvent()` after successful mutations to ensure events are logged.

### `TimesheetService`

Records events for:

*   **Timesheet Entry:** `created`, `updated`, `deleted`
*   **Approval:** `approved`, `rejected`

### `ActionCodeService`

Records events for:

*   **Action Code:** `action_code_created`, `action_code_updated`, `action_code_deleted`

### Future Integrations

*   **Weekend Permit Service:** `permit_granted`, `permit_revoked`
*   **Retro Edit Service:** `retro_edit_enabled`, `retro_edit_disabled`
*   **Timesheet Week Submission:** `submitted`, `auto_sent`
