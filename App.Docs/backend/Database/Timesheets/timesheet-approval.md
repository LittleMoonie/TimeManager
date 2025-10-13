# TimesheetApproval Entity

## Overview

The `TimesheetApproval` entity represents a record of an approval decision for a submitted timesheet. It tracks who approved or rejected a timesheet, when the decision was made, and any associated reasons. This entity is vital for maintaining an audit trail of timesheet workflows and ensuring accountability.

This entity is defined in `App.API/Entities/Timesheets/TimesheetApproval.ts`.

## Entity Definition

```typescript
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import { Company } from '../Companies/Company';
import { Timesheet } from './Timesheet';
import User from '../Users/User';

/**
 * @description Defines the possible statuses for a timesheet approval.
 */
export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/**
 * @description Represents an approval record for a timesheet.
 */
@Entity('timesheet_approvals')
@Index(['companyId', 'timesheetId', 'approverId'], { unique: true })
export class TimesheetApproval extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this timesheet approval belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column('uuid') companyId!: string;
  /**
   * @description The company associated with this timesheet approval.
   */
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description The unique identifier of the timesheet being approved.
   * @example "t1i2m3e4-s5h6e7e8-9012-3456-7890abcdef"
   */
  @Column('uuid') timesheetId!: string;
  /**
   * @description The timesheet associated with this approval.
   */
  @ManyToOne(() => Timesheet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'timesheetId' })
  timesheet!: Timesheet;

  /**
   * @description The unique identifier of the user who is approving the timesheet.
   * @example "a1p2p3r4-o5v6e7r8-9012-3456-7890abcdef"
   */
  @Column('uuid') approverId!: string;
  /**
   * @description The user who is approving the timesheet.
   */
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'approverId' })
  approver!: User;

  /**
   * @description The current status of the timesheet approval.
   * @example "PENDING"
   */
  @Column({ type: 'varchar', length: 16, default: ApprovalStatus.PENDING })
  status!: ApprovalStatus;

  /**
   * @description Optional: A reason or comment for the approval decision (e.g., rejection reason).
   * @example "Approved as submitted"
   */
  @Column({ type: 'text', nullable: true }) reason?: string;
  /**
   * @description Optional: Timestamp when the approval decision was made.
   * @example "2024-01-08T10:00:00Z"
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  decidedAt?: Date;
}
```

## Columns

In addition to the fields inherited from `BaseEntity`, the `TimesheetApproval` entity includes:

| Column Name   | Type                     | Description                                                                    |
| :------------ | :----------------------- | :----------------------------------------------------------------------------- |
| `companyId`   | `UUID`                   | Foreign Key to `Company.id`.                                                   |
| `timesheetId` | `UUID`                   | Foreign Key to `Timesheet.id`, identifying the timesheet being approved.       |
| `approverId`  | `UUID`                   | Foreign Key to `User.id`, identifying the user who made the approval decision. |
| `status`      | `VARCHAR(16)`            | The current status of the approval (`PENDING`, `APPROVED`, `REJECTED`).        |
| `reason`      | `TEXT` (nullable)        | Optional reason or comment for the approval decision.                          |
| `decidedAt`   | `TIMESTAMPTZ` (nullable) | Timestamp when the approval decision was made.                                 |

## Relations

- **`company`**: `@ManyToOne` relationship with `Company` entity.
- **`timesheet`**: `@ManyToOne` relationship with `Timesheet` entity. `onDelete: "CASCADE"` ensures that if a timesheet is deleted, its approvals are also removed.
- **`approver`**: `@ManyToOne` relationship with `User` entity, representing the user who approved/rejected the timesheet.

## Indexes

To optimize query performance and ensure data integrity, the `TimesheetApproval` entity defines the following index:

- `@Index(["companyId", "timesheetId", "approverId"], { unique: true })`: Ensures that a timesheet can only have one approval record per approver within a company.

## Constraints

- **Unique Approval**: A timesheet can only be approved/rejected once by a specific approver within a company.
- **Foreign Keys**: Enforced for `companyId`, `timesheetId`, and `approverId` to maintain referential integrity with `Company`, `Timesheet`, and `User` entities, respectively. `onDelete: "RESTRICT"` (for company and approver) prevents deletion of referenced entities, while `onDelete: "CASCADE"` (for timesheet) ensures dependent approvals are removed.
