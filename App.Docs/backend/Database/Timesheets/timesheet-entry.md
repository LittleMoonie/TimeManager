# TimesheetEntry Entity

## Overview

The `TimesheetEntry` entity represents a single record of work performed by a user, typically associated with a specific timesheet. It captures details such as the action performed, duration, date, location, and work mode. This entity is fundamental for tracking time and activities within the GoGoTime application.

This entity is defined in `App.API/Entities/Timesheets/TimesheetEntry.ts`.

## Entity Definition

```typescript
import { Column, Entity, ManyToOne, Check, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '../BaseEntity';
import User from '../Users/User';
import { Company } from '../Companies/Company';
import { ActionCode } from './ActionCode';
import { Timesheet } from './Timesheet';

/**
 * @description Defines the possible work modes for a timesheet entry.
 */
export enum WorkMode {
  OFFICE = 'office',
  REMOTE = 'remote',
  HYBRID = 'hybrid',
}

/**
 * @description Represents a single entry within a timesheet, detailing work performed.
 */
@Entity('timesheet_entries')
@Check(`"durationMin" BETWEEN 0 AND 1440`)
@Index(['companyId', 'userId', 'day'])
@Index(['companyId', 'timesheetId'])
export class TimesheetEntry extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this timesheet entry belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column('uuid') companyId!: string;
  /**
   * @description The company associated with this timesheet entry.
   */
  @ManyToOne(() => Company, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'companyId' })
  company!: Company;

  /**
   * @description The unique identifier of the user who made this timesheet entry.
   * @example "u1s2e3r4-i5d6-7890-1234-567890abcdef"
   */
  @Column('uuid') userId!: string;
  /**
   * @description The user who made this timesheet entry.
   */
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  /**
   * @description Optional: The unique identifier of the timesheet this entry belongs to.
   * @example "t1i2m3e4-s5h6e7e8-9012-3456-7890abcdef"
   */
  @Column('uuid', { nullable: true }) timesheetId?: string;
  /**
   * @description Optional: The timesheet this entry belongs to.
   */
  @ManyToOne(() => Timesheet, (t) => t.entries, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'timesheetId' })
  timesheet?: Timesheet;

  /**
   * @description The unique identifier of the action code associated with this entry.
   * @example "a1c2t3i4-o5n6-7890-1234-567890abcdef"
   */
  @Column('uuid') actionCodeId!: string;
  /**
   * @description The action code associated with this entry.
   */
  @ManyToOne(() => ActionCode, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'actionCodeId' })
  actionCode!: ActionCode;

  /**
   * @description The work mode for this entry (e.g., "office", "remote", "hybrid").
   * @example "office"
   */
  @Column({ type: 'varchar', length: 8, default: WorkMode.OFFICE })
  workMode!: WorkMode;

  /**
   * @description The country code (ISO 3166-1 alpha-2) where the work was performed.
   * @example "US"
   */
  @Column({ type: 'varchar', length: 2 }) country!: string;

  /**
   * @description Optional: Timestamp when the work for this entry started.
   * @example "2024-01-01T09:00:00Z"
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  startedAt?: Date;
  /**
   * @description Optional: Timestamp when the work for this entry ended.
   * @example "2024-01-01T17:00:00Z"
   */
  @Column({ type: 'timestamp with time zone', nullable: true }) endedAt?: Date;

  /**
   * @description The duration of the entry in minutes.
   * @example 480
   */
  @Column('int') durationMin!: number; // store computed duration for fast totals
  /**
   * @description The date of the timesheet entry in ISO date format (YYYY-MM-DD).
   * @example "2024-01-01"
   */
  @Column('date') day!: string; // denormalized day for quick filtering
  /**
   * @description Optional: Any notes or comments for this specific entry.
   * @example "Worked on feature X"
   */
  @Column({ type: 'text', nullable: true }) note?: string;
}
```

## Columns

In addition to the fields inherited from `BaseEntity`, the `TimesheetEntry` entity includes:

| Column Name    | Type                     | Description                                                               |
| :------------- | :----------------------- | :------------------------------------------------------------------------ |
| `companyId`    | `UUID`                   | Foreign Key to `Company.id`.                                              |
| `userId`       | `UUID`                   | Foreign Key to `User.id`.                                                 |
| `timesheetId`  | `UUID` (nullable)        | Foreign Key to `Timesheet.id`, linking the entry to a specific timesheet. |
| `actionCodeId` | `UUID`                   | Foreign Key to `ActionCode.id`, categorizing the work performed.          |
| `workMode`     | `VARCHAR(8)`             | The mode of work (e.g., `OFFICE`, `REMOTE`, `HYBRID`).                    |
| `country`      | `VARCHAR(2)`             | ISO 3166-1 alpha-2 country code where work was performed.                 |
| `startedAt`    | `TIMESTAMPTZ` (nullable) | Optional timestamp when the work for this entry started.                  |
| `endedAt`      | `TIMESTAMPTZ` (nullable) | Optional timestamp when the work for this entry ended.                    |
| `durationMin`  | `INT`                    | Duration of the entry in minutes (0-1440).                                |
| `day`          | `DATE`                   | The date of the timesheet entry (YYYY-MM-DD).                             |
| `note`         | `TEXT` (nullable)        | Optional notes or comments for this entry.                                |

## Relations

- **`company`**: `@ManyToOne` relationship with `Company` entity.
- **`user`**: `@ManyToOne` relationship with `User` entity.
- **`timesheet`**: `@ManyToOne` relationship with `Timesheet` entity. `onDelete: "SET NULL"` allows timesheet deletion without deleting entries.
- **`actionCode`**: `@ManyToOne` relationship with `ActionCode` entity.

## Indexes

To optimize query performance and ensure data integrity, the `TimesheetEntry` entity defines the following indexes:

- `@Index(["companyId", "userId", "day"])`: For efficient retrieval of entries for a specific user on a given day within a company.
- `@Index(["companyId", "timesheetId"])`: For efficient retrieval of all entries belonging to a specific timesheet within a company.

## Constraints

- **Duration Range**: `@Check("durationMin" BETWEEN 0 AND 1440)` ensures that the `durationMin` column stores values between 0 and 1440 (inclusive).
- **Foreign Keys**: Enforced for `companyId`, `userId`, `timesheetId`, and `actionCodeId` to maintain referential integrity with `Company`, `User`, `Timesheet`, and `ActionCode` entities, respectively. `onDelete: "RESTRICT"` (except for `timesheetId`) prevents deletion of referenced entities.
