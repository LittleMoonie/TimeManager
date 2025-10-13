# Timesheet History Module

This document outlines the design and functionality of the Timesheet History module, which provides an auditable log of significant events related to timesheets within the GoGoTime application.

## Overview

The Timesheet History module captures every critical event on timesheets and related entities, including creation, updates, deletions of timesheet entries and action codes, week submissions, approvals, rejections, auto-sends, weekend permit grants/revocations, and retro-edit toggles. This ensures a comprehensive audit trail for compliance and operational transparency.

# Timesheet History Module

This document outlines the design and functionality of the Timesheet History module, which provides an auditable log of significant events related to timesheets within the GoGoTime application.

## Overview

The Timesheet History module captures every critical event on timesheets and related entities, including creation, updates, deletions of timesheet entries and action codes, week submissions, approvals, rejections, auto-sends, weekend permit grants/revocations, and retro-edit toggles. This ensures a comprehensive audit trail for compliance and operational transparency.

## Database: `TimesheetHistory` Entity

The `TimesheetHistory` entity serves as the central audit log for all significant events occurring within the timesheet management system. It provides a detailed, immutable record of who did what, when, and to which entity, along with any relevant context or changes. This is crucial for:

- **Compliance**: Meeting regulatory requirements for data change tracking.
- **Troubleshooting**: Diagnosing issues by reviewing the sequence of events.
- **Accountability**: Providing a clear trail of actions performed by users or the system.
- **Data Integrity**: Understanding how data evolved over time.

This entity is defined in `App.API/Entities/Timesheets/TimesheetHistory.ts` and is designed for efficient querying and includes mechanisms for ensuring data integrity and idempotency.

```typescript
// App.API/Entities/Timesheets/TimesheetHistory.ts
import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import { Company } from '../Companies/Company';

/**
 * @description Interface for a string-to-string dictionary, used for metadata and diffs.
 */
export interface IStringToStringDictionary {
  [key: string]: string;
}

/**
 * @description Records historical events related to timesheet entities.
 */
@Entity('timesheet_history')
@Index(['companyId', 'userId'])
@Index(['companyId', 'targetType', 'targetId'])
export class TimesheetHistory extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this history record belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column('uuid') companyId!: string;

  /**
   * @description The company associated with this history record.
   */
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description The unique identifier of the user associated with the timesheet entity that this history record pertains to.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column('uuid') userId!: string; // owner of timesheet/entry

  /**
   * @description The type of the target entity that the history record refers to.
   * @example "Timesheet"
   */
  @Column({ type: 'varchar', length: 32 }) targetType!:
    | 'Timesheet'
    | 'TimesheetEntry'
    | 'TimesheetApproval'
    | 'ActionCode';

  /**
   * @description The unique identifier of the target entity.
   * @example "t1i2m3e4-s5h6e7e8-9012-3456-7890abcdef"
   */
  @Column('uuid') targetId!: string;

  /**
   * @description The action that was performed on the target entity.
   * @example "created"
   */
  @Column({ type: 'varchar', length: 32 }) action!:
    | 'created'
    | 'updated'
    | 'submitted'
    | 'approved'
    | 'rejected'
    | 'deleted';

  /**
   * @description Optional: The unique identifier of the user who performed the action, if different from `userId`.
   * @example "a1c2t3o4-r5u6s7e8-9012-3456-7890abcdef"
   */
  @Column('uuid', { nullable: true }) actorUserId?: string;

  /**
   * @description Optional: A reason or comment for the action.
   * @example "Initial creation"
   */
  @Column({ type: 'text', nullable: true }) reason?: string;
  /**
   * @description Optional: A JSON object representing the difference in state before and after the action.
   * @example { "status": "DRAFT", "newStatus": "SUBMITTED" }
   */
  @Column({ type: 'jsonb', nullable: true }) diff?: IStringToStringDictionary;
  /**
   * @description Optional: Additional metadata related to the action.
   * @example { "ipAddress": "192.168.1.1" }
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: IStringToStringDictionary;

  /**
   * @description The timestamp when the action occurred.
   * @example "2024-01-01T10:00:00Z"
   */
  @Column({ type: 'timestamp with time zone', default: () => 'now()' })
  occurredAt!: Date;
}
```

### Indexes

Indexes are defined on the `TimesheetHistory` entity using TypeORM's `@Index()` decorator to optimize common query patterns:

- `@Index(["companyId", "userId"])`
- `@Index(["companyId", "targetType", "targetId"])`

### Constraints

Constraints are defined at the entity level using TypeORM decorators or implicitly by column types and relationships:

- **Foreign Keys**: Relationships to `Company` and `User` entities are defined with `@ManyToOne` and `@JoinColumn`, enforcing referential integrity with `onDelete: "RESTRICT"`.
- **Column Types**: `targetType` and `action` columns use `varchar` with specific `length` constraints, effectively acting as `ENUM-like` types by restricting values at the application level.
- **Unique Indexes**: Unique constraints are enforced by `@Index({ unique: true })` where applicable (e.g., `companyId`, `targetType`, `targetId` combination).
- **BaseEntity**: Inherits `BaseEntity` which provides `id` (UUID primary key), `createdAt`, `updatedAt`, `deletedAt`, `createdByUserId`, `updatedByUserId`, and `version` columns with their respective constraints and defaults.

## API Routes

### `GET /api/v1/timesheet-history`

Retrieves a paginated list of timesheet history events. Results are scoped based on the user's role:

- **Employees:** Can only view their own history.
- **Managers/Admins:** Can view company-wide history.

**Query Parameters:**

- `targetType?`: Filter by target entity type (`Timesheet`, `TimesheetEntry`, `TimesheetApproval`, `ActionCode`).
- `targetId?`: Filter by the UUID of the affected entity.
- `userId?`: Filter by the subject user's ID (ignored for employees).
- `from?`, `to?`: Filter by `occurredAt` timestamp range (ISO datetime).
- `action?`: Filter by specific actions (`created`, `updated`, `deleted`, `submitted`, `approved`, `rejected`).
- `limit?`: Pagination limit (1-200, default 50).
- `cursor?`: Opaque string for keyset pagination.

### `GET /api/v1/timesheet-history/entity/:targetType/:targetId`

Convenience endpoint to fetch history for a specific entity.

## Integration with Services

Other services are responsible for calling `TimesheetHistoryService.recordEvent()` after successful mutations to ensure events are logged. The `recordEvent` method in `TimesheetHistoryService` (or directly in the respective service) is used to capture these changes.

### `TimesheetService`

Records events for:

- **Timesheet:** `created`, `submitted`, `approved`, `rejected`
- **Timesheet Entry:** `created` (when added to a timesheet)

### `ActionCodeService`

Records events for:

- **Action Code:** `created`, `updated`, `deleted`

### `TimesheetApprovalService`

Records events for:

- **Timesheet Approval:** `created`, `updated` (status changes)
