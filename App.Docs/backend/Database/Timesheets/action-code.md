# ActionCode Entity

## Overview

The `ActionCode` entity represents a categorization for timesheet entries within a company. These codes help classify the type of work performed (e.g., "Development", "Meeting", "Support") and can indicate whether the work is billable or non-billable. This entity is essential for detailed time tracking and reporting.

This entity is defined in `App.API/Entities/Timesheets/ActionCode.ts`.

## Entity Definition

```typescript
import { Column, Entity, ManyToOne, Index, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Company } from "../Companies/Company";

/**
 * @description Defines the type of an action code, indicating if it's billable or non-billable.
 */
export enum ActionCodeType {
  BILLABLE = "billable",
  NON_BILLABLE = "non-billable",
}

/**
 * @description Represents an action code used for categorizing timesheet entries within a company.
 */
@Entity("action_codes")
@Unique(["companyId", "code"])
@Index(["companyId", "code"])
export class ActionCode extends BaseEntity {
  /**
   * @description The unique identifier of the company to which this action code belongs.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @Column("uuid") companyId!: string;

  /**
   * @description The company associated with this action code.
   */
  @ManyToOne(() => Company, (c) => c.actionCodes, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  /**
   * @description A unique short code for the action (e.g., "DEV", "MEETING").
   * @example "DEV"
   */
  @Column({ type: "varchar", length: 255 }) code!: string;
  /**
   * @description The display name of the action code (e.g., "Development", "Team Meeting").
   * @example "Development"
   */
  @Column({ type: "varchar", length: 255 }) name!: string;

  /**
   * @description The type of the action code, indicating if it's billable or non-billable.
   * @example "billable"
   */
  @Column({ type: "varchar", length: 16, default: ActionCodeType.BILLABLE })
  type!: ActionCodeType;

  /**
   * @description Indicates if the action code is currently active.
   * @example true
   */
  @Column({ type: "boolean", default: true }) active!: boolean;
}
```

## Columns

In addition to the fields inherited from `BaseEntity`, the `ActionCode` entity includes:

| Column Name      | Type                 | Description                                                               |
| :--------------- | :------------------- | :------------------------------------------------------------------------ |
| `companyId`      | `UUID`               | Foreign Key to `Company.id`.                                              |
| `code`           | `VARCHAR(255)`       | A unique short code for the action (e.g., `DEV`, `MEETING`).              |
| `name`           | `VARCHAR(255)`       | The display name of the action code (e.g., `Development`).                |
| `type`           | `VARCHAR(16)`        | The type of the action code (`billable` or `non-billable`).               |
| `active`         | `BOOLEAN`            | Indicates if the action code is currently active.                         |

## Relations

*   **`company`**: `@ManyToOne` relationship with `Company` entity.

## Indexes

To optimize query performance and ensure data integrity, the `ActionCode` entity defines the following indexes:

*   `@Unique(["companyId", "code"])`: Ensures that the combination of company ID and action code is unique.
*   `@Index(["companyId", "code"])`: For efficient lookups by action code within a company.

## Constraints

*   **Unique Code per Company**: Ensures that each action code is unique within a given company.
*   **Foreign Keys**: Enforced for `companyId` to maintain referential integrity with the `Company` entity. `onDelete: "RESTRICT"` prevents deletion of a company if action codes are still associated with it.